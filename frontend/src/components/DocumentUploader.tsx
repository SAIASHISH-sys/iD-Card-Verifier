import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileCheck, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

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
      setError("Upload failed. Please try again.");
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
      setError("Verification failed. Please try again.");
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-6 h-6" />
          Document Verification
        </CardTitle>
        <CardDescription>
          Upload your official document for secure verification and processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Document Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Student ID", "PAN Card", "Aadhar Card"].map((docType) => (
                <label
                  key={docType}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${ selectedOption === docType
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="docType"
                    value={docType}
                    checked={selectedOption === docType}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="sr-only"
                  />
                  <span>{docType}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="file-upload" className="text-base font-semibold">
              Upload Document
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="file-upload"
                type="file"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  } else {
                    setFile(null);
                  }
                }}
                className="flex-1"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Button type="submit" disabled={loading} className="min-w-32">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 border border-destructive bg-destructive/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>

        {uploadedUrl && (
          <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Uploaded Document</Label>
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <FileCheck className="w-4 h-4 text-primary" />
                <a 
                  href={uploadedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex-1 truncate"
                >
                  {filename}
                </a>
              </div>
              {file?.type.startsWith("image/") && (
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded document" 
                  className="max-w-full h-auto rounded-lg border"
                />
              )}
            </div>
            
            <Button 
              onClick={verifyDocument}
              disabled={verifying}
              variant="default"
              className="w-full"
              size="lg"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying Document...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify Document
                </>
              )}
            </Button>
          </div>
        )}

        {ocrResult && (
          <Card className="mt-6 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {ocrResult.verification && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Document Type</Label>
                      <p className="font-semibold">{ocrResult.verification.document_type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <p className={`font-semibold ${ocrResult.verification.verified ? 'text-green-600' : 'text-destructive'}`}>
                        {ocrResult.verification.verified ? "✓ Verified" : "✗ Not Verified"}
                      </p>
                    </div>
                  </div>
                  
                  {ocrResult.verification.extracted_data && Object.keys(ocrResult.verification.extracted_data).length > 0 && (
                    <div className="space-y-3">
                      <Label className="font-semibold">Extracted Information</Label>
                      <div className="grid gap-3">
                        {Object.entries(ocrResult.verification.extracted_data).map(([key, value]) => (
                          <div key={key} className="flex flex-col p-3 bg-muted/50 rounded">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            <p className="font-medium mt-1">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
                  View Full OCR Data
                </summary>
                <pre className="mt-3 p-4 bg-muted rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(ocrResult, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
