import DocumentUploader from "./components/DocumentUploader";
import { Shield, FileText, Lock } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Document Verification Portal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Secure • Reliable 
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Secure Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed with bank-level security and encryption
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Multiple Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Support for PDF, JPG, PNG and other document formats
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy Protected</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal information is never shared or stored permanently
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Uploader */}
        <DocumentUploader />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              © {new Date().getFullYear()} Document Verification Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
