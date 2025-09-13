import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function DocumentUploader() {
  const [selectedOption, setSelectedOption] = useState<string>(""); // Student ID, PAN, Aadhar
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Upload and process function
  async function uploadAndProcessFile(file: File, option: string) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", option); // sending the type to backend

    try {
      const res = await fetch("http://localhost:5000/upload-and-process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload and processing failed");
      const data = await res.json();
      console.log("Upload and OCR result:", data);
      
      if (data.success) {
        setUploadedUrl(data.fileUrl);
        setOcrResult(data.data);
        setError("");
      } else {
        setError(data.error || "Processing failed");
      }
    } catch (err) {
      console.error(err);
      setError("Upload and processing failed");
    } finally {
      setLoading(false);
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
    await uploadAndProcessFile(file, selectedOption);
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
          {loading ? "Processing..." : "Upload & Process"}
        </button>
      </form>

      {loading && <p style={{ color: "blue" }}>Processing document...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {uploadedUrl && (
        <div style={{ marginTop: "10px" }}>
          <p>Uploaded File:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
          <br />
          <img src={uploadedUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
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
