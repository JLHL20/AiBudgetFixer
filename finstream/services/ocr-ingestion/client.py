import grpc
import sys
import os
import pytesseract
from PIL import Image
import re


# This helps Python find the generated files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import audit_pb2
import audit_pb2_grpc

# Point to the Engine
# In case there is an error "check this patch"
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_items(text):
    """
    Scans text for lines that look like: "Item Name ... 12.99"
    Returns a list of tuples: [("Item Name", 12.99), ...]
    """
    items = []
    lines = text.split('\n')
    
    # REGEX EXPLANATION:
    # (.*?)       -> Capture the item name (any text at start)
    # \s+         -> Space separator
    # (\d+\.\d{2}) -> Capture the price (number.number)
    # \s* -> Optional space
    # [A-Z]?$       -> Optional tax flag (Walmart uses X or N)
    # $ -> End of line
    item_pattern = re.compile(r'(.*?)\s+(\d+\.\d{2})\s*[A-Z]?$')

    for line in lines:
        # Clean up the line
        clean_line = line.strip()
        match = item_pattern.search(clean_line)
        
        # Filter out "trash" lines (dates, phone numbers, subtotals)
        if match and "SUBTOTAL" not in clean_line and "TOTAL" not in clean_line:
            name = match.group(1).strip()
            # If name is too short (OCR noise), skip it
            if len(name) > 3:
                price = float(match.group(2))
                items.append((name, price))
                
    return items

def run(image_path):
    print(f"📸 Scanning Receipt: {image_path}")
    
    try:
        raw_text = pytesseract.image_to_string(Image.open(image_path))
    except Exception as e:
        print(f"❌ OCR Failed: {e}")
        return

    items = parse_items(raw_text)
    if not items:
        print("⚠️ No items found.")
        return

    print(f"🔌 Connecting to Smart Budget Engine...\n")
    
    with grpc.insecure_channel('localhost:50051') as channel:
        # NOTICE: We use the new Stub name if the service name changed, 
        # but usually it's best to check audit_pb2_grpc.py. 
        # Since we changed the service to BudgetService, we use that Stub:
        stub = audit_pb2_grpc.BudgetServiceStub(channel)
        
        # New Table Header
        print(f"{'ITEM NAME':<25} | {'PRICE':<8} | {'CATEGORY':<15} | {'STATUS'}")
        print("-" * 75)

        for name, price in items:
            # NEW REQUEST TYPE
            request = audit_pb2.ItemRequest(
                name=name, 
                price=price
            )
            
            try:
                # NEW METHOD CALL
                response = stub.EvaluateItem(request)
                
                print(f"{name[:23]:<25} | ${price:<7.2f} | {response.category:<15} | {response.suggestion}")
                
            except grpc.RpcError as e:
                print(f"❌ Error: {e.details()}")

        print("-" * 75)
    
if __name__ == '__main__':
    # Use the receipt.jpg if no argument is provided
    img = sys.argv[1] if len(sys.argv) > 1 else "receipt.jpg"
    run(img)