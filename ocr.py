
"""
OCR PDF Text Extraction Script
Extracts text elements from PDF and outputs as JSON
"""

import cv2
import pytesseract
import fitz  # PyMuPDF
import numpy as np
import os
import sys
import shutil
import json
from PIL import Image

# --- PDF & Tesseract Setup ---

# Check if file path is provided as argument
if len(sys.argv) > 1:
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found!")
        sys.exit(1)
else:
    # Fallback to uploads directory scanning (for backward compatibility)
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        print(f"Error: {uploads_dir} directory not found!")
        sys.exit(1)

    files = [f for f in os.listdir(uploads_dir) if os.path.isfile(os.path.join(uploads_dir, f))]
    if not files:
        print(f"Error: No files found in {uploads_dir} directory!")
        sys.exit(1)
    if len(files) > 1:
        print(f"Warning: Multiple files found in {uploads_dir}. Using the first one: {files[0]}")

    file_path = os.path.join(uploads_dir, files[0])

print(f"Processing file: {file_path}")

# If input is a JPG/JPEG/PNG, convert to PDF
img_exts = [".jpg", ".jpeg", ".png"]
root, ext = os.path.splitext(file_path)
if ext.lower() in img_exts:
    img = Image.open(file_path)
    pdf_path = root + ".pdf"
    img.convert("RGB").save(pdf_path, "PDF", resolution=100.0)
    #print(f"Converted image {file_path} to PDF: {pdf_path}")
    file_path = pdf_path

# Tesseract detection / override
if os.name == "nt":
    default_win = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    pytesseract.pytesseract.tesseract_cmd = os.environ.get("TESSERACT_PATH", default_win)
else:
    candidates = [
        os.environ.get("TESSERACT_PATH"),
        shutil.which("tesseract"),
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    candidates = [c for c in candidates if c]
    for cand in candidates:
        if cand and (os.path.isfile(cand) or shutil.which(cand)):
            pytesseract.pytesseract.tesseract_cmd = cand
            break
    else:
        print("Error: tesseract not found. Install: sudo apt install -y tesseract-ocr")
        print("Or export TESSERACT_PATH=/path/to/tesseract")
        sys.exit(1)

#print(f"Using tesseract at: {pytesseract.pytesseract.tesseract_cmd}")
#print(f"Opening PDF: {file_path}")

# Open PDF and extract text elements
try:
    pdf_document = fitz.open(file_path)
except Exception as e:
    print(f"Error opening PDF file: {e}")
    print("Please make sure the file path is correct.")

    sys.exit(1)

# Process first page (can be extended for multiple pages)
page = pdf_document[0]
# Using a moderate DPI for good balance between accuracy and performance
pix = page.get_pixmap(dpi=200) 
base_img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3).copy()
rgb_img_for_ocr = cv2.cvtColor(base_img, cv2.COLOR_BGR2RGB)

# Perform OCR and get detailed word data
word_data = pytesseract.image_to_data(rgb_img_for_ocr, output_type=pytesseract.Output.DICT)


# Create final JSON structure
sample_object = {
    "page number": {  # page number
        "block number": {  # block number
            "paragraph number": {  # paragraph number
                "line number": {  # line number
                    "word number": {  # word number
                        "text": "SampleText",
                        "confidence": 99,
                        "bounding_box": {
                            "left": 100,
                            "top": 200,
                            "width": 50,
                            "height": 20
                        }
                    }
                }
            }
        }
    }
}
# Group elements by page > block > paragraph > line > word
grouped = {}
for i in range(len(word_data['text'])):
    if int(word_data['conf'][i]) > 60 and word_data['text'][i].strip():
        page = str(word_data['page_num'][i])
        block = str(word_data['block_num'][i])
        para = str(word_data['par_num'][i])
        line = str(word_data['line_num'][i])
        word = str(word_data['word_num'][i])
        element = {
            "text": word_data['text'][i].strip(),
            "confidence": int(word_data['conf'][i]),
            "bounding_box": {
                "left": int(word_data['left'][i]),
                "top": int(word_data['top'][i]),
                "width": int(word_data['width'][i]),
                "height": int(word_data['height'][i])
            }
        }
        grouped.setdefault(page, {})
        grouped[page].setdefault(block, {})
        grouped[page][block].setdefault(para, {})
        grouped[page][block][para].setdefault(line, {})
        grouped[page][block][para][line][word] = element


result = {
    "source_file": file_path,
    "page_count": len(pdf_document),
    "processed_page": 0,
    "image_dimensions": {
        "width": base_img.shape[1],
        "height": base_img.shape[0]
    },
    "sample_object": sample_object,
    "elements": grouped
}

# Aadhaar detection logic
def is_aadhaar_number(s):
    return len(s) == 12 and s.isdigit()

# Initialize verification results
verification_result = {
    "document_type": "UNKNOWN",
    "verified": False,
    "extracted_data": {}
}

aadhaar_found = False
pan_found = False

for page in grouped.values():
    for block in page.values():
        for para in block.values():
            for line in para.values():
                # Aadhaar check
                if len(line) == 3:
                    words = [line[word_num]["text"] for word_num in sorted(line, key=lambda x: int(x))]
                    joined = ''.join(words).replace(' ', '')

                    if is_aadhaar_number(joined):
                        verification_result["document_type"] = "AADHAR"
                        verification_result["verified"] = True
                        verification_result["extracted_data"]["aadhaar_number"] = joined
                        aadhaar_found = True
                        print("VERIFIED!! with aadhar")
                        break
                
                # INCOME TAX DEPARTMENT check
                words_in_line = [line[word_num]["text"] for word_num in sorted(line, key=lambda x: int(x))]
                line_text = ' '.join(words_in_line).upper().replace('  ', ' ').strip()
                if ("INCOME" in line_text or "TAX" in line_text):
                    # Remove extra spaces for comparison
                    normalized = ' '.join(line_text.split())
                    if normalized == "INCOME TAX DEPARTMENT GOVT. OF INDIA":
                        verification_result["document_type"] = "PAN"
                        verification_result["verified"] = True
                        pan_found = True
                        
                        # Detect and extract PAN number
                        for word in words_in_line:
                            if len(word) == 10:
                                if word[:5].isalpha() and word[5:9].isdigit():
                                    print("VERIFIED! with PAN")
                                    verification_result["extracted_data"]["pan_number"] = word
            if aadhaar_found or pan_found:
                break
        if aadhaar_found or pan_found:
            break
    if aadhaar_found or pan_found:
        break

# Add verification result to main result
result["verification"] = verification_result


# Break if no elements found
if not grouped:
    verification_result["verified"] = False
    verification_result["document_type"] = "NOT_VERIFIED"

# Optionally save to file in uploads directory
base_filename = os.path.basename(os.path.splitext(file_path)[0])
output_file = os.path.join("uploads", f"{base_filename}_ocr_results.json")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"OCR results saved to: {output_file}")

pdf_document.close()
