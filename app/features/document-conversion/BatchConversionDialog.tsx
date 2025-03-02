import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Progress } from '~/components/ui/progress';
import { toast } from 'sonner';
import { useDocumentConversion } from '~/lib/hooks/useDocumentConversion';
import type { DocumentMeta } from '~/lib/storage';

interface BatchConversionDialogProps {
  open: boolean;
  documents: DocumentMeta[];
  selectedDocIds: string[];
  onOpenChange: (open: boolean) => void;
  onConversionComplete: () => void;
}

export function BatchConversionDialog({
  open,
  documents,
  selectedDocIds,
  onOpenChange,
  onConversionComplete
}: BatchConversionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isConverting, 
    conversionProgress, 
    batchConvertToPDF 
  } = useDocumentConversion(() => {
    // This will be called when conversion is complete
    onConversionComplete();
    
    // Reset state after a delay
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
    }, 1000);
  });

  // Filter out documents that are already PDFs
  const docsToConvert = documents.filter(doc => 
    selectedDocIds.includes(doc.id) && 
    doc.type !== 'application/pdf'
  );

  const handleBatchConvertToPDF = async () => {
    if (selectedDocIds.length === 0) {
      toast.error('No documents selected for conversion');
      return;
    }

    if (docsToConvert.length === 0) {
      toast.info('All selected documents are already in PDF format');
      onOpenChange(false);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use the hook's batchConvertToPDF method which handles duplicate checking
      const result = await batchConvertToPDF(docsToConvert);
      
      if (!result) {
        // If conversion failed or was cancelled, reset state
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error batch converting documents:', error);
      toast.error('Failed to convert documents');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isConverting && !isProcessing) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Convert to PDF</DialogTitle>
          <DialogDescription>
            Convert {docsToConvert.length} document(s) to PDF format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This will convert all selected non-PDF documents to PDF format. 
              {documents.filter(doc => selectedDocIds.includes(doc.id) && doc.type === 'application/pdf').length > 0 && 
                ` ${documents.filter(doc => selectedDocIds.includes(doc.id) && doc.type === 'application/pdf').length} document(s) are already in PDF format and will be skipped.`
              }
            </AlertDescription>
          </Alert>
          
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
            disabled={isConverting || isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBatchConvertToPDF}
            disabled={isConverting || isProcessing || docsToConvert.length === 0}
          >
            Convert to PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 