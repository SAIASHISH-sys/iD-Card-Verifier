from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import PyPDF2
import subprocess
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def run_ocr_processing(filepath):
    """Run the OCR script for a specific file"""
    try:
        result = subprocess.run(
            ['./venv/bin/python', 'ocr.py', filepath],
            cwd=os.getcwd(),
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            return None, f"OCR failed: {result.stderr}"
        try:
            return json.loads(result.stdout), None
        except json.JSONDecodeError as e:
            return None, f"JSON parse error: {e}"
    except Exception as e:
        return None, str(e)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    doc_type = request.form.get('type', 'unknown')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        file_url = f"http://localhost:5001/uploads/{filename}"

        extracted_text = ""
        if filename.lower().endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)

        return jsonify({
            'success': True,
            'fileUrl': file_url,
            'filename': filename,
            'document_type': doc_type,
            'extracted_text': extracted_text
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/process-ocr', methods=['POST'])
def process_ocr():
    data = request.get_json()
    if not data or "filename" not in data:
        return jsonify({'error': 'Filename not provided'}), 400

    filename = data["filename"]
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404

    ocr_data, error = run_ocr_processing(filepath)
    if error:
        return jsonify({'success': False, 'error': error}), 500
    
    return jsonify({'success': True, 'data': ocr_data})

@app.route('/uploads/<filename>')
def get_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/test')
def test():
    return jsonify({'message': 'Flask server running!'})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)
