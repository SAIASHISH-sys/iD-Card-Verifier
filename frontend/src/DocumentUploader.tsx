import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function DocumentUploader() {
  const [selectedOption, setSelectedOption] = useState<string>(""); // Student ID, PAN, Aadhar
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null); // store filename separately
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Upload function
  async function uploadFile(file: File, option: string) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", option); // sending the type to backend

    try {
      const res = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      console.log("Uploaded file URL:", data.fileUrl);
      setUploadedUrl(data.fileUrl);
      setFilename(data.filename);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  // Verify function
  async function verifyDocument() {
    if (!filename) {
      setError("Please upload a file first");
      return;
    }

    setVerifying(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:5001/process-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, type: selectedOption }),
      });

      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      console.log("OCR verification result:", data);
      
      if (data.success) {
        setOcrResult(data.data);
        setError("");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOption) {
      setError("Please select a document type");
      return;
    }
    if (!file) {
      setError("Please select a file");
      return;
    }
    await uploadFile(file, selectedOption);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Document</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="radio"
              name="docType"
              value="Student ID"
              checked={selectedOption === "Student ID"}
              onChange={(e) => setSelectedOption(e.target.value)}
            />{" "}
            Student ID
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              name="docType"
              value="PAN Card"
              checked={selectedOption === "PAN Card"}
              onChange={(e) => setSelectedOption(e.target.value)}
            />{" "}
            PAN Card
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              name="docType"
              value="Aadhar Card"
              checked={selectedOption === "Aadhar Card"}
              onChange={(e) => setSelectedOption(e.target.value)}
            />{" "}
            Aadhar Card
          </label>
        </div>

        <div style={{ marginTop: "10px" }}>
          <input
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              } else {
                setFile(null);
              }
            }}
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {loading && <p style={{ color: "blue" }}>Uploading document...</p>}
      {verifying && <p style={{ color: "blue" }}>Verifying document...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {uploadedUrl && (
        <div style={{ marginTop: "10px" }}>
          <p>Uploaded File:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
          <br />
          <img src={uploadedUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
          
          {/* Verify Button */}
          <div style={{ marginTop: "15px" }}>
            <button 
              onClick={verifyDocument}
              disabled={verifying}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: verifying ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              {verifying ? "Verifying..." : "🔍 Verify Document"}
            </button>
          </div>
        </div>
      )}

      {ocrResult && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "5px" }}>
          <h3>Document Verification Result</h3>
          {ocrResult.verification && (
            <div>
              <p><strong>Document Type:</strong> {ocrResult.verification.document_type}</p>
              <p><strong>Verified:</strong> {ocrResult.verification.verified ? "✅ Yes" : "❌ No"}</p>
              {ocrResult.verification.extracted_data && Object.keys(ocrResult.verification.extracted_data).length > 0 && (
                <div>
                  <h4>Extracted Information:</h4>
                  {Object.entries(ocrResult.verification.extracted_data).map(([key, value]) => (
                    <p key={key}><strong>{key.replace('_', ' ').toUpperCase()}:</strong> {value as string}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <details style={{ marginTop: "15px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>View Full OCR Data</summary>
            <pre style={{ 
              background: "#f5f5f5", 
              padding: "10px", 
              borderRadius: "3px", 
              fontSize: "12px",
              overflow: "auto",
              maxHeight: "300px"
            }}>
              {JSON.stringify(ocrResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
