import { useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import axios from "axios";
import Uploader from "./Uploader";
import DocumentUploader from "./DocumentUploader";


function App() {
  const [showUploader, setShowUploader] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    if (selected && selected.type && selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select or drop a file!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<{ fileUrl: string }>("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedUrl(res.data.fileUrl);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
      <section
        style={{
          background: "#f0f0f0",
          padding: "40px",
          textAlign: "center",
          borderRadius: "10px",
        }}
      >
         <div>
      <h1>Document Upload Portal</h1>
      <DocumentUploader />
    </div>
        <div style={{ padding: "20px" }}>
          <h1>Image Upload Test</h1>
          <Uploader />
        </div>

        <h2>File Upload Page</h2>
        <button
          onClick={() => setShowUploader(!showUploader)}
          style={{
            padding: "10px 20px",
            background: "#4cafef",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          {showUploader ? "Hide Upload Section" : "Upload a File"}
        </button>
      </section>

      {showUploader && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `3px dashed ${dragActive ? "#4cafef" : "#aaa"}`,
              padding: "40px",
              borderRadius: "10px",
              background: dragActive ? "#e8f6ff" : "#fafafa",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={() => {
              const input = document.getElementById("fileInput") as HTMLInputElement | null;
              if (input) input.click();
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: "300px", borderRadius: "8px" }}
              />
            ) : file ? (
              <p>{file && "name" in file ? file.name : "File selected"}</p>
            ) : (
              <p>Drag & Drop your file here or Click to browse</p>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            onChange={handleChange}
            style={{ display: "none" }}
          />

          <button
            onClick={handleUpload}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#4cafef",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Upload
          </button>

          {uploadedUrl && (
            <div style={{ marginTop: "20px" }}>
              <h4>Uploaded File:</h4>
              <a href={uploadedUrl} target="_blank" rel="noreferrer">
                {uploadedUrl}
              </a>
              {file && "type" in file && typeof file.type === "string" && file.type.startsWith("image/") && (
                <div>
                  <img
                    src={uploadedUrl}
                    alt="Uploaded"
                    style={{
                      maxWidth: "300px",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
