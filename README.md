# 📄 ID Card Verifier

A modern, secure document verification portal built with React, TypeScript, and Flask. This application allows users to upload identity documents (PAN Card, Aadhaar Card, etc.) and automatically extract information using OCR technology.

## ✨ Features

- 🔒 **Secure Processing** - Bank-level security and encryption
- 📱 **Multiple Formats** - Support for PDF, JPG, PNG and other document formats
- 🛡️ **Privacy Protected** - Personal information is never stored permanently
- 🎨 **Modern UI** - Built with Tailwind CSS v4 and shadcn/ui components
- ⚡ **Fast OCR** - Quick document text extraction
- 🎯 **Document Type Detection** - Automatic identification of document types

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **TypeScript 5.8.3** - Type-safe code
- **Vite 7.1.2** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **OCR Libraries** - Document text extraction
- **CORS Support** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **Python 3.8+**
- **npm** or **yarn**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iD-Card-Verifier
```

### 2. Backend Setup

Create and activate a Python virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 4. Running the Application

#### Start the Backend Server (Terminal 1)

From the root directory:

```bash
# Make sure virtual environment is activated
python app.py
```

The backend will start on `http://localhost:5001`

#### Start the Frontend Development Server (Terminal 2)

From the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or `http://localhost:5174` if port 5173 is in use)

### 5. Using the Application

1. Open your browser and navigate to the frontend URL
2. Select the document type (PAN Card or Aadhaar Card)
3. Click "Choose File" and select your document
4. Click "Upload and Verify"
5. View the extracted information and verification results

## 📁 Project Structure

```
iD-Card-Verifier/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── label.tsx
│   │   │   └── DocumentUploader.tsx
│   │   ├── lib/             # Utility functions
│   │   │   └── utils.ts
│   │   ├── App.tsx          # Main app component
│   │   ├── index.css        # Global styles with Tailwind
│   │   └── main.tsx         # App entry point
│   ├── package.json
│   ├── vite.config.ts       # Vite configuration
│   └── tsconfig.json        # TypeScript configuration
├── app.py                   # Flask backend server
├── ocr.py                   # OCR processing logic
├── preprocess.py            # Image preprocessing
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🎨 UI Components

The application uses **shadcn/ui** components built with **Tailwind CSS v4**:

- **Button** - Multiple variants (default, outline, ghost, etc.)
- **Card** - Content containers with header, title, and footer
- **Input** - Form inputs with file upload support
- **Label** - Accessible form labels

## 🔧 Configuration

### Backend Configuration

The Flask backend runs on port `5001` by default. You can modify this in `app.py`.

### Frontend Configuration

Frontend configuration is in `vite.config.ts`:
- Path aliases configured for `@/` imports
- Tailwind CSS v4 Vite plugin enabled

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try port 5174. Make sure the backend is running on port 5001.

### Python Dependencies Issues

Make sure your virtual environment is activated before installing dependencies:
```bash
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### Frontend Build Issues

Clear node_modules and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

### POST /upload
Upload a document for verification

**Request:**
- `file`: Document file (multipart/form-data)
- `document_type`: Type of document ("PAN" or "Aadhaar")

**Response:**
```json
{
  "message": "Document processed successfully",
  "document_type": "PAN",
  "extracted_data": { ... },
  "ocr_text": "..."
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Team Name

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
