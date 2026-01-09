import sys
import os
import pytesseract
from PIL import Image
import re

# Helps Python find files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import audit_pb2
import audit_pb2_grpc

# OCR Path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_name(raw_name):
    """
    Translates store abbreviations into human-readable names.
    """
    # 1. Remove common noise characters at the start
    name = raw_name.strip()
    name = re.sub(r'^[Q0-9\W]+', '', name) # Removes "Q", numbers, or symbols at start

    # 2. Dictionary of Store Codes -> Human Words
    replacements = {
        "OG ": "Organic ",
        "BBY ": "Baby ",
        "CNUT": "Coconut",
        "HRMHRV": "Harm Harv",
        "KITHL": "Kitchen",
        "CHV": "Chive",
        "VTLFR": "Vital Farms",
        "FRGRPR": "Forager Project",
        "SUNBTR": "Sunbutter",
        "ARKF": "Ark Foods",
        "EMMYOG": "Emmy's Organics",
        "HWRRI": "Hu",
        "SZGF": "Siete",
        "ETNEV": "Evolved",
        "CV ": "Cave ",
        "WTG": "Weighted",
        "BRUSHED": "", # "Potatoes Brushed" -> "Potatoes"
        "CAVENDISH": "", # "Banana Cavendish" -> "Banana"
        "BAG": "",
    }

    # 3. Apply replacements
    for code, replacement in replacements.items():
        name = name.replace(code, replacement)

    # 4. Final Cleanup (Title Case looks nicer: "BABY CARROTS" -> "Baby Carrots")
    return name.strip().title()

def parse_items(text):
    items = []
    lines = text.split('\n')
    
    # Flexible Regex for finding prices
    item_pattern = re.compile(r'(.*?)\s+\$?(\d+\.\d{2}).*$')

    # Words to ignore
    ignore_words = ["SUBTOTAL", "TOTAL", "TAX", "SALE", "PRIME", "CHANGE", "CASH", "VISA", "NET SALES", "SOLD ITEMS", "TARE", "BAL"]

    for line in lines:
        clean_line = line.strip().upper()
        
        # Skip ignore words
        if any(word in clean_line for word in ignore_words):
            continue

        # Skip negative numbers
        if "-" in clean_line and "$" in clean_line:
            continue

        match = item_pattern.search(clean_line)
        
        if match:
            raw_name = match.group(1).strip()
            
            # Filter noise
            if len(raw_name) > 2 and "@" not in raw_name:
                try:
                    price = float(match.group(2))
                    
                    # --- NEW STEP: CLEAN THE NAME ---
                    human_name = clean_name(raw_name)
                    
                    items.append((human_name, price))
                except ValueError:
                    continue
                
    return items

# Note: The 'run' function is handled by app.py now, so we don't strictly need it here,
# but keeping parse_items available for import is key.