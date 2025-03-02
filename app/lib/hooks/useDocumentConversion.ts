import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { saveDocument, getDocument, getAllDocuments } from '~/lib/storage';
import { convertDocument, mergeImagesToPDF } from '~/lib/conversion';
import { generateTimestampFilename, getFileNameWithoutExtension } from '~/lib/utils/format-utils';
import type { DocumentMeta } from '~/lib/storage';

/**
 * Custom hook for document conversion operations
 */
export function useDocumentConversion(onConversionComplete?: () => void) {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  // Check if a PDF version of the document already exists
  const checkForExistingPDF = useCallback(async (document: DocumentMeta): Promise<boolean> => {
    const allDocuments = await getAllDocuments();
    const baseFileName = getFileNameWithoutExtension(document.name);
    
    // Check if there's already a PDF with the same base name
    const existingPDF = allDocuments.find(doc => 
      doc.type === 'application/pdf' && 
      getFileNameWithoutExtension(doc.name) === baseFileName
    );
    
    return !!existingPDF;
  }, []);

  // Get existing PDF document if it exists
  const getExistingPDFDocument = useCallback(async (document: DocumentMeta): Promise<DocumentMeta | null> => {
    const allDocuments = await getAllDocuments();
    const baseFileName = getFileNameWithoutExtension(document.name);
    
    // Find the PDF with the same base name
    const existingPDF = allDocuments.find(doc => 
      doc.type === 'application/pdf' && 
      getFileNameWithoutExtension(doc.name) === baseFileName
    );
    
    return existingPDF || null;
  }, []);

  // Convert a single document to PDF
  const convertToPDF = useCallback(async (document: DocumentMeta) => {
    if (document.type === 'application/pdf') {
      toast.info('Document is already a PDF');
      return false;
    }

    // Check if a PDF version already exists
    const existingPDF = await getExistingPDFDocument(document);
    if (existingPDF) {
      toast.info(`A PDF version already exists: ${existingPDF.name}`);
      return false;
    }

    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Get the document data
      const doc = await getDocument(document.id);
      if (!doc) {
        throw new Error('Document not found');
      }

      // Convert to PDF
      const convertedDoc = await convertDocument(
        doc.data, 
        document, 
        'application/pdf',
        { quality: 0.95 }
      );
      
      // Complete progress
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      toast.success(`Converted ${document.name} to PDF`);
      
      // Notify parent component
      if (onConversionComplete) {
        onConversionComplete();
      }
      
      return true;
    } catch (error) {
      console.error('Error converting document:', error);
      toast.error(`Failed to convert ${document.name} to PDF`);
      return false;
    } finally {
      setTimeout(() => {
        setIsConverting(false);
        setConversionProgress(0);
      }, 500);
    }
  }, [onConversionComplete, getExistingPDFDocument]);

  // Batch convert documents to PDF
  const batchConvertToPDF = useCallback(async (documents: DocumentMeta[]) => {
    // Filter out documents that are already PDFs
    const docsToConvert = documents.filter(doc => doc.type !== 'application/pdf');
    
    if (docsToConvert.length === 0) {
      toast.info('All selected documents are already PDFs');
      return false;
    }

    // Check for existing PDF versions
    const docsWithExistingPDFs: string[] = [];
    const docsToActuallyConvert: DocumentMeta[] = [];
    
    for (const doc of docsToConvert) {
      const existingPDF = await getExistingPDFDocument(doc);
      if (existingPDF) {
        docsWithExistingPDFs.push(doc.name);
      } else {
        docsToActuallyConvert.push(doc);
      }
    }
    
    if (docsToActuallyConvert.length === 0) {
      toast.info('PDF versions of all selected documents already exist');
      return false;
    }
    
    if (docsWithExistingPDFs.length > 0) {
      const skipMessage = `Skipping ${docsWithExistingPDFs.length} document(s) that already have PDF versions`;
      if (docsWithExistingPDFs.length <= 3) {
        const fileList = docsWithExistingPDFs.join(', ');
        toast.info(`${skipMessage}: ${fileList}`);
      } else {
        toast.info(skipMessage);
      }
    }

    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Convert each document
      for (const doc of docsToActuallyConvert) {
        // Get the document data
        const fullDoc = await getDocument(doc.id);
        if (!fullDoc) {
          console.warn(`Document ${doc.id} not found, skipping`);
          continue;
        }

        // Convert to PDF
        await convertDocument(
          fullDoc.data, 
          doc, 
          'application/pdf'
        );
      }

      // Complete progress
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      toast.success(`Converted ${docsToActuallyConvert.length} documents to PDF`);
      
      // Notify parent component
      if (onConversionComplete) {
        onConversionComplete();
      }
      
      return true;
    } catch (error) {
      console.error('Error batch converting documents:', error);
      toast.error('Failed to convert some documents to PDF');
      return false;
    } finally {
      setTimeout(() => {
        setIsConverting(false);
        setConversionProgress(0);
      }, 500);
    }
  }, [onConversionComplete, getExistingPDFDocument]);

  // Merge images to PDF
  const mergeImages = useCallback(async (documents: DocumentMeta[]) => {
    // Filter out non-image documents
    const imageDocuments = documents.filter(doc => doc.type.startsWith('image/'));
    
    if (imageDocuments.length < 2) {
      toast.error('Please select at least 2 images to merge');
      return false;
    }

    console.log('Starting merge process with images:', imageDocuments.map(doc => doc.name));
    
    // Sort image documents by ID to ensure consistent comparison
    const sortedImageIds = [...imageDocuments].sort((a, b) => a.id.localeCompare(b.id)).map(doc => doc.id);
    
    // Generate a unique identifier for this specific set of images
    const mergeSetIdentifier = sortedImageIds.join('_');
    console.log('Generated merge set identifier:', mergeSetIdentifier);
    
    // Check if a merged PDF with the same set of images already exists
    const allDocuments = await getAllDocuments();
    console.log('Checking against existing documents:', allDocuments.length);
    
    // Look for existing merged documents with more robust filtering
    const existingMergedPDFs = allDocuments.filter(doc => 
      doc.type === 'application/pdf' && 
      (doc.name.startsWith('merged-images-') || (doc.metadata && doc.metadata.isMergedDocument))
    );
    
    console.log('Found existing merged PDFs:', existingMergedPDFs.length);
    
    // Check metadata for source images (if available)
    for (const doc of existingMergedPDFs) {
      console.log('Checking document:', doc.name, 'Metadata:', doc.metadata);
      
      // Check if this document has metadata about source images
      if (doc.metadata && doc.metadata.sourceImageIds) {
        const sourceIds = doc.metadata.sourceImageIds as string[];
        
        // If the arrays have different lengths, they can't be the same set
        if (sourceIds.length !== sortedImageIds.length) {
          continue;
        }
        
        // Sort the source IDs for consistent comparison
        const sortedSourceIds = [...sourceIds].sort((a, b) => a.localeCompare(b));
        
        // Check if every ID in sortedImageIds exists in sortedSourceIds
        const isExactMatch = sortedImageIds.length === sortedSourceIds.length && 
                            sortedImageIds.every((id, index) => id === sortedSourceIds[index]);
        
        console.log('Comparing identifiers:', {
          existing: sortedSourceIds.join('_'),
          current: mergeSetIdentifier,
          match: isExactMatch
        });
        
        // If we find a match, notify the user and return
        if (isExactMatch) {
          toast.info(`A PDF with these exact images already exists: ${doc.name}`);
          return false;
        }
      }
    }

    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Prepare images for merging
      const docsWithData: Array<{ meta: DocumentMeta, data: ArrayBuffer }> = [];
      
      for (const doc of imageDocuments) {
        // Get the image data
        const fullDoc = await getDocument(doc.id);
        if (!fullDoc) {
          console.warn(`Document ${doc.id} not found, skipping`);
          continue;
        }
        
        docsWithData.push({
          meta: doc,
          data: fullDoc.data
        });
      }

      // Merge images to PDF
      if (docsWithData.length < 2) {
        throw new Error('Not enough valid images to merge');
      }
      
      // Add metadata about source images to track which images were merged
      const mergeMetadata = {
        sourceImageIds: imageDocuments.map(doc => doc.id),
        mergeSetIdentifier,
        isMergedDocument: true,
        createdAt: Date.now()
      };
      
      console.log('Creating merged PDF with metadata:', mergeMetadata);
      
      const mergedDoc = await mergeImagesToPDF(docsWithData, mergeMetadata);
      console.log('Merged PDF created:', mergedDoc);

      // Complete progress
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      toast.success('Images merged into PDF successfully');
      
      // Notify parent component
      if (onConversionComplete) {
        onConversionComplete();
      }
      
      return true;
    } catch (error) {
      console.error('Error merging images to PDF:', error);
      toast.error('Failed to merge images to PDF');
      return false;
    } finally {
      setTimeout(() => {
        setIsConverting(false);
        setConversionProgress(0);
      }, 500);
    }
  }, [onConversionComplete]);

  return {
    isConverting,
    conversionProgress,
    convertToPDF,
    batchConvertToPDF,
    mergeImages,
    checkForExistingPDF,
    getExistingPDFDocument
  };
} 