const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Allow requests from your frontend (local)
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer storage config (sanitizes name a bit)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

// Optional: file size limit and simple filter (5 MB and allow all types here)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    // If you want to limit to images only, uncomment below:
    // if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});

app.use('/uploads', express.static(UPLOAD_DIR));

// Upload endpoint — expects field name "file"
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.filename });
});

// OCR Processing endpoint
app.post('/process-ocr', (req, res) => {
  console.log('Starting OCR processing...');
  
  // Run the Python OCR script
  exec('python3 ocr.py', { 
    cwd: __dirname,
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large JSON output
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('OCR processing error:', error);
      return res.status(500).json({ 
        error: 'OCR processing failed', 
        details: error.message 
      });
    }
    
    if (stderr) {
      console.warn('OCR stderr:', stderr);
    }
    
    try {
      // Parse the JSON output from Python script
      const ocrResult = JSON.parse(stdout);
      console.log('OCR processing completed successfully');
      res.json({
        success: true,
        data: ocrResult
      });
    } catch (parseError) {
      console.error('Failed to parse OCR output:', parseError);
      console.error('Raw output:', stdout);
      res.status(500).json({ 
        error: 'Failed to parse OCR results',
        raw_output: stdout
      });
    }
  });
});

// Combined upload and OCR processing endpoint
app.post('/upload-and-process', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  console.log('File uploaded, starting OCR processing...');
  
  // Run the Python OCR script after file upload
  exec('python3 ocr.py', { 
    cwd: __dirname,
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large JSON output
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('OCR processing error:', error);
      return res.status(500).json({ 
        error: 'OCR processing failed', 
        details: error.message,
        fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`
      });
    }
    
    if (stderr) {
      console.warn('OCR stderr:', stderr);
    }
    
    try {
      // Parse the JSON output from Python script
      const ocrResult = JSON.parse(stdout);
      console.log('OCR processing completed successfully');
      res.json({
        success: true,
        fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
        filename: req.file.filename,
        data: ocrResult
      });
    } catch (parseError) {
      console.error('Failed to parse OCR output:', parseError);
      console.error('Raw output:', stdout);
      res.status(500).json({ 
        error: 'Failed to parse OCR results',
        fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
        raw_output: stdout
      });
    }
  });
});

// Simple error handler (catches Multer errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  if (err) return res.status(500).json({ error: err.message || 'Server error' });
  next();
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
