import { useState, useEffect, useCallback } from "react";
import { DocumentUploadArea } from "~/features/document-upload/DocumentUploadArea";
import { DocumentList } from "~/features/document-list/DocumentList";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { useDocuments } from "~/lib/hooks/useDocuments";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";

/**
 * Main page component for document management
 */
export function DocumentsPage() {
  const { loadDocuments } = useDocuments();
  const [showAlert, setShowAlert] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);
  
  // Force reload documents when component mounts or when uploads happen
  useEffect(() => {
    console.log('DocumentsPage: Loading documents (uploadCount:', uploadCount, ')');
    loadDocuments();
    
    // Set up a second reload after a delay to ensure storage is updated
    if (uploadCount > 0) {
      const timer = setTimeout(() => {
        console.log('DocumentsPage: Delayed reload after upload');
        loadDocuments();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loadDocuments, uploadCount]);
  
  // Handle upload complete by incrementing the counter to trigger the effect
  const handleUploadComplete = useCallback(() => {
    console.log('Upload complete in DocumentsPage, triggering reload');
    setUploadCount(prev => prev + 1);
  }, []);
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>
      
      {showAlert && (
        <Alert className="mb-6 relative pr-10" variant="default">
          <AlertTitle>Welcome to DocFlow Lite</AlertTitle>
          <AlertDescription>
            Upload documents, convert them to PDF, and merge multiple images into a single PDF.
          </AlertDescription>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-3 right-3 h-6 w-6 rounded-full p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setShowAlert(false)}
            aria-label="Dismiss notification"
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </Alert>
      )}
      
      <DocumentUploadArea onUploadComplete={handleUploadComplete} />
      
      <DocumentList key={`document-list-${uploadCount}`} />
    </div>
  );
} 