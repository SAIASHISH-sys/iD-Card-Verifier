import { useState } from "react";
import type { ChangeEvent } from "react";

export default function Uploader() {
  const [preview, setPreview] = useState<string | null>(null);

  // Upload function goes here
  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    console.log('Uploaded file URL:', data.fileUrl);
    return data.fileUrl;
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = await uploadFile(file);
      setPreview(url);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {preview && (
        <div>
          <p>Uploaded File:</p>
          <img src={preview} alt="Uploaded" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </div>
  );
}
