import { useState, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { saveDocument } from "~/lib/storage";
import { formatFileSize } from "~/lib/utils/format-utils";

interface DocumentUploadAreaProps {
  onUploadComplete: () => void;
  acceptedFileTypes?: string[];
}

/**
 * Component for uploading documents with drag and drop support
 */
export function DocumentUploadArea({
  onUploadComplete,
  acceptedFileTypes = ["application/pdf", "image/*"]
}: DocumentUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  // Process files for upload
  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const totalFiles = files.length;
    let uploadedFiles = 0;
    let uploadedDocuments = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if file type is accepted
      const isAccepted = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(`${category}/`);
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        toast.error(`File type not supported: ${file.type}`);
        continue;
      }
      
      try {
        setCurrentFile(file.name);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + Math.random() * 10;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 200);
        
        // Save the document
        const savedDoc = await saveDocument(file);
        if (savedDoc) {
          uploadedDocuments.push(savedDoc);
        }
        
        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        uploadedFiles++;
        
        // Short delay before processing next file
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    // Reset state with a delay to ensure storage is updated
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFile(null);
      
      if (uploadedFiles > 0) {
        toast.success(`Uploaded ${uploadedFiles} file${uploadedFiles > 1 ? 's' : ''}`);
        console.log('Upload complete, calling onUploadComplete()');
        
        // Make a single call to onUploadComplete after all files are processed
        // The parent component will handle the refresh logic
        onUploadComplete();
      }
    }, 500);
  }, [acceptedFileTypes, onUploadComplete]);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    processFiles(files);
  }, [processFiles]);
  
  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    processFiles(files);
    
    // Reset the input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);
  
  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isUploading ? undefined : handleClick}
      >
        {isUploading ? (
          <div className="py-4">
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Uploading {currentFile}
            </p>
            <Progress value={uploadProgress} className="h-2 mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {uploadProgress.toFixed(0)}%
            </p>
          </div>
        ) : (
          <div className="py-6">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              Drag and drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, PNG, JPEG, WebP
            </p>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept={acceptedFileTypes.join(",")}
        onChange={handleFileInputChange}
      />
    </div>
  );
} 