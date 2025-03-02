import { useState, useEffect, useCallback } from 'react';
import { getAllDocuments, getDocument, saveDocument, deleteDocument } from '~/lib/storage';
import { toast } from 'sonner';
import type { DocumentMeta } from '~/lib/storage';

/**
 * Custom hook for document management operations
 */
export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load all documents
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear the current documents first to ensure UI updates
      setDocuments([]);
      
      // Small delay to ensure the UI reflects the loading state
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Load documents from storage
      const docs = await getAllDocuments();
      console.log('Loaded documents:', docs.length); // Debug log
      
      // Custom sorting:
      // 1. Separate generated documents (merged PDFs) from regular uploads
      // 2. Sort regular uploads by creation date (newest first)
      // 3. Sort generated documents by creation date (oldest first)
      // 4. Combine them with regular uploads first, then generated documents
      const sortedDocs = [...docs].sort((a, b) => {
        // Check if documents are generated (merged PDFs, converted PDFs, or have metadata flags)
        const aIsGenerated = a.name.startsWith('merged-images-') || 
                            (a.metadata && (a.metadata.isMergedDocument || a.metadata.isGeneratedDocument));
        const bIsGenerated = b.name.startsWith('merged-images-') || 
                            (b.metadata && (b.metadata.isMergedDocument || b.metadata.isGeneratedDocument));
        
        // If one is generated and the other isn't, put regular uploads first
        if (aIsGenerated && !bIsGenerated) return 1;
        if (!aIsGenerated && bIsGenerated) return -1;
        
        // If both are generated or both are regular uploads, sort by date
        if (aIsGenerated && bIsGenerated) {
          // Sort generated documents by creation date (oldest first)
          return (a.createdAt || 0) - (b.createdAt || 0);
        } else {
          // Sort regular uploads by creation date (newest first)
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
      });
      
      setDocuments(sortedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // View a document
  const viewDocument = useCallback(async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (!doc) {
        toast.error('Document not found');
        return null;
      }
      
      // Convert ArrayBuffer to Blob and create URL
      const blob = new Blob([doc.data], { type: doc.meta.type });
      const url = URL.createObjectURL(blob);
      
      return { meta: doc.meta, url };
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document');
      return null;
    }
  }, []);

  // Download a document
  const downloadDocument = useCallback(async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (!doc) {
        toast.error('Document not found');
        return false;
      }
      
      // Create a blob and download link
      const blob = new Blob([doc.data], { type: doc.meta.type });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.meta.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Document download started');
      return true;
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
      return false;
    }
  }, []);

  // Delete a document
  const removeDocument = useCallback(async (id: string) => {
    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
        setSelectedDocIds(prevIds => prevIds.filter(docId => docId !== id));
        toast.success('Document deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete document');
        return false;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  }, []);

  // Share a document
  const shareDocument = useCallback(async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (!doc) {
        toast.error('Document not found');
        return false;
      }
      
      // Check if Web Share API is available
      if (navigator.share) {
        const blob = new Blob([doc.data], { type: doc.meta.type });
        const file = new File([blob], doc.meta.name, { type: doc.meta.type });
        
        await navigator.share({
          title: doc.meta.name,
          files: [file]
        });
        
        toast.success('Document shared successfully');
        return true;
      } else {
        // Fallback for browsers that don't support Web Share API
        toast.error('Sharing is not supported in this browser');
        return false;
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled the share operation
        return false;
      }
      toast.error('Failed to share document');
      return false;
    }
  }, []);

  // Toggle document selection
  const toggleDocumentSelection = useCallback((id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id) 
        : [...prev, id]
    );
  }, []);

  // Select all documents
  const selectAllDocuments = useCallback(() => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map(doc => doc.id));
    }
  }, [documents, selectedDocIds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedDocIds([]);
  }, []);

  return {
    documents,
    isLoading,
    selectedDocIds,
    loadDocuments,
    viewDocument,
    downloadDocument,
    removeDocument,
    shareDocument,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection
  };
} 