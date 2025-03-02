import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Progress } from '~/components/ui/progress';
import { toast } from 'sonner';
import { getDocument } from '~/lib/storage';
import { CONVERSION_FORMATS, FORMAT_MAP, convertDocument } from '~/lib/conversion';
import type { DocumentMeta } from '~/lib/storage';

interface ConversionDialogProps {
  open: boolean;
  document: { meta: DocumentMeta; url: string };
  initialFormat: string | null;
  onOpenChange: (open: boolean) => void;
  onConversionComplete: () => void;
}

export function ConversionDialog({ 
  open, 
  document, 
  initialFormat, 
  onOpenChange, 
  onConversionComplete 
}: ConversionDialogProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedDocument, setConvertedDocument] = useState<{ meta: DocumentMeta, url: string } | null>(null);
  const [conversionFormat, setConversionFormat] = useState<string | null>(initialFormat);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Update conversion format when initialFormat changes
  useEffect(() => {
    setConversionFormat(initialFormat);
  }, [initialFormat]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConversionError(null);
      setConvertedDocument(null);
    }
  }, [open]);

  // Get available conversion formats for a document
  const getAvailableConversionFormats = (docType: string) => {
    return CONVERSION_FORMATS[docType as keyof typeof CONVERSION_FORMATS] || [];
  };

  // Format the conversion type for display
  const formatConversionType = (type: string) => {
    return FORMAT_MAP[type] || type;
  };

  const handleConvertDocument = async () => {
    if (!document || !conversionFormat) {
      setConversionError('Please select a conversion format');
      return;
    }
    
    setIsConverting(true);
    setConversionProgress(0);
    setConversionError(null);
    
    try {
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
      
      // Get the document data
      const doc = await getDocument(document.meta.id);
      if (!doc) {
        throw new Error('Document not found');
      }
      
      // Convert the document using our conversion service
      const convertedMeta = await convertDocument(
        doc.data, 
        doc.meta, 
        conversionFormat, 
        { quality: 0.95 }
      );
      
      // Get the converted document for preview
      const convertedDoc = await getDocument(convertedMeta.id);
      if (!convertedDoc) {
        throw new Error('Failed to retrieve converted document');
      }
      
      // Create URL for preview
      const blob = new Blob([convertedDoc.data], { type: convertedMeta.type });
      const url = URL.createObjectURL(blob);
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      // Set the converted document
      setConvertedDocument({ meta: convertedMeta, url });
      
      toast.success('Document converted successfully');
      
      // Notify parent component
      onConversionComplete();
      
      // Reset conversion state after a delay
      setTimeout(() => {
        setIsConverting(false);
        setConversionProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error converting document:', error);
      setConversionError('Failed to convert document. Please try again.');
      toast.error('Failed to convert document');
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  const handleRetryConversion = () => {
    setConversionError(null);
    handleConvertDocument();
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (convertedDocument) {
        URL.revokeObjectURL(convertedDocument.url);
      }
    };
  }, [convertedDocument]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Document</DialogTitle>
          <DialogDescription>
            Convert "{document.meta.name}" to {conversionFormat ? formatConversionType(conversionFormat) : "another format"}
          </DialogDescription>
        </DialogHeader>
        
        {!convertedDocument ? (
          <>
            {conversionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{conversionError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 py-4">
              {!conversionFormat && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Select conversion format:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableConversionFormats(document.meta.type).map((format) => (
                      <Button
                        key={format}
                        variant={conversionFormat === format ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setConversionFormat(format)}
                      >
                        {formatConversionType(format)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {conversionFormat && (
                <Alert>
                  <AlertTitle>Selected Format</AlertTitle>
                  <AlertDescription>
                    Converting to {formatConversionType(conversionFormat)}
                  </AlertDescription>
                </Alert>
              )}
              
              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Converting...</span>
                    <span>{Math.round(conversionProgress)}%</span>
                  </div>
                  <Progress value={conversionProgress} className="h-2" />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConvertDocument}
                disabled={!conversionFormat || isConverting}
              >
                Convert
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <Alert className="mb-4">
                <AlertTitle>Conversion Complete</AlertTitle>
                <AlertDescription>
                  Your document has been successfully converted to {formatConversionType(convertedDocument.meta.type)}
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 flex justify-center">
                {convertedDocument.meta.type === 'application/pdf' ? (
                  <div className="w-full max-h-[200px] overflow-hidden border rounded">
                    <iframe 
                      src={`${convertedDocument.url}#toolbar=0`} 
                      className="w-full h-[200px]"
                      title={convertedDocument.meta.name}
                    />
                  </div>
                ) : (
                  <div className="border rounded p-2 bg-black/5">
                    <img 
                      src={convertedDocument.url} 
                      alt={convertedDocument.meta.name}
                      className="max-w-full max-h-[200px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  // We would typically call a view function here, but we'll let the parent handle it
                }}
              >
                View Document
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 