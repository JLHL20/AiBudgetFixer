import os
import sys
import grpc
from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image, ImageOps

# Import your existing parsing logic
from client import parse_items

# Import the generated gRPC code
# (These files must be in the same folder as app.py)
import audit_pb2
import audit_pb2_grpc

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_receipt():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        # 1. Image Processing (The Eyes)
        image = Image.open(file.stream)
        image = image.convert('L') # Grayscale
        width, height = image.size
        new_size = (width * 2, height * 2)
        image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        custom_config = r'--psm 6'
        raw_text = pytesseract.image_to_string(image, config=custom_config)
        
        # 2. Parsing (The Logic)
        # Returns list of tuples: [("Lettuce", 2.49), ...]
        raw_items = parse_items(raw_text)
        
        enriched_items = []
        
        # 3. Microservice Communication (The Handshake)
        # Connect to the Go Audit Engine running on port 50051
        try:
            with grpc.insecure_channel('localhost:50051') as channel:
                stub = audit_pb2_grpc.BudgetServiceStub(channel)
                
                print(f"Connecting to Microservice for {len(raw_items)} items...")

                for name, price in raw_items:
                    # Create the gRPC request object
                    rpc_request = audit_pb2.ItemRequest(name=name, price=price)
                    
                    # Call the Go Engine!
                    rpc_response = stub.EvaluateItem(rpc_request)
                    
                    # Save the smart data
                    enriched_items.append({
                        "name": name,
                        "price": price,
                        "category": rpc_response.category,   # From Go
                        "suggestion": rpc_response.suggestion # From Go
                    })
                    
        except grpc.RpcError as e:
            print(f"⚠️ Microservice Error: {e}")
            # Fallback: If Go is down, just show the item without category
            enriched_items = [{"name": n, "price": p, "category": "Unknown", "suggestion": "Service Down"} for n, p in raw_items]

        # Calculate total
        total = sum(item['price'] for item in enriched_items)

        return jsonify({
            "message": "Success",
            "total": total,
            "items": enriched_items
        })

    except Exception as e:
        print(f"Error processing receipt: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)