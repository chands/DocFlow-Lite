import { useState, useRef, useEffect } from 'react';
import { saveDocument, getAllDocuments, deleteDocument } from '../lib/storage';
import type { DocumentMeta } from '../lib/storage';
import type { Route } from './+types/documents';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getAllDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
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
      }
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setIsLoading(true);
    try {
      const uploadPromises = files.map(file => saveDocument(file));
      const newDocMetas = await Promise.all(uploadPromises);
      setDocuments(prevDocs => [...prevDocs, ...newDocMetas]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
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

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Documents</h1>
      
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-12 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
        } transition-colors duration-200 ease-in-out mb-8`}
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
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drag and drop your documents here, or <span className="text-blue-500">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Supports PDF and image files
        </p>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : documents.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.map((doc) => (
              <li key={doc.id} className="px-6 py-4 flex items-center">
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
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(doc.size / 1024).toFixed(2)} KB • {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button 
                    className="text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => {/* View document implementation */}}
                  >
                    View
                  </button>
                  <button 
                    className="text-sm text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
} 