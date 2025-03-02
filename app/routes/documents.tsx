import { useState, useRef, useEffect } from 'react';
import { saveDocument, getAllDocuments, deleteDocument, getDocument } from '../lib/storage';
import type { DocumentMeta } from '../lib/storage';
import type { Route } from './+types/documents';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { toast } from 'sonner';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documents - DocFlow Lite" },
    { name: "description", content: "Upload, organize, and manage your documents with DocFlow Lite." },
  ];
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ meta: DocumentMeta, url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getAllDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf' || file.type.startsWith('image/')
      );
      
      if (newFiles.length > 0) {
        await handleFileUpload(newFiles);
      } else {
        toast.error('Only PDF and image files are supported');
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf' || file.type.startsWith('image/')
      );
      
      if (newFiles.length > 0) {
        await handleFileUpload(newFiles);
      } else {
        toast.error('Only PDF and image files are supported');
      }
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
      
      const uploadPromises = files.map(file => saveDocument(file));
      const newDocMetas = await Promise.all(uploadPromises);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setDocuments(prevDocs => [...prevDocs, ...newDocMetas]);
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload documents');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (!doc) {
        toast.error('Document not found');
        return;
      }
      
      // Convert ArrayBuffer to Blob and create URL
      const blob = new Blob([doc.data], { type: doc.meta.type });
      const url = URL.createObjectURL(blob);
      
      setSelectedDocument({ meta: doc.meta, url });
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document');
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (selectedDocument) {
        URL.revokeObjectURL(selectedDocument.url);
      }
    };
  }, [selectedDocument]);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Documents</h1>
      
      {/* Upload area */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            } transition-colors duration-200 ease-in-out`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              multiple 
              accept="application/pdf,image/*"
              onChange={handleFileInputChange}
            />
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">
              Drag and drop your documents here, or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Supports PDF and image files
            </p>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document list */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : documents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 flex items-center">
                  <div className="flex-shrink-0">
                    {doc.type === 'application/pdf' ? (
                      <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium truncate">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary cursor-pointer"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive cursor-pointer"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No documents uploaded yet</p>
          </CardContent>
        </Card>
      )}

      {/* Document viewer dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.meta.name}</DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <span>
                  {formatFileSize(selectedDocument.meta.size)} • 
                  {formatDate(selectedDocument.meta.createdAt)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedDocument && (
              selectedDocument.meta.type === 'application/pdf' ? (
                <iframe 
                  src={`${selectedDocument.url}#toolbar=0`} 
                  className="w-full h-full border-0"
                  title={selectedDocument.meta.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/5">
                  <img 
                    src={selectedDocument.url} 
                    alt={selectedDocument.meta.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 