import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { toast } from 'sonner';
import { useDocumentConversion } from '~/lib/hooks/useDocumentConversion';
import type { DocumentMeta } from '~/lib/storage';

interface MergeDialogProps {
  open: boolean;
  documents: DocumentMeta[];
  selectedDocIds: string[];
  onOpenChange: (open: boolean) => void;
  onMergeComplete: () => void;
}

export function MergeDialog({
  open,
  documents,
  selectedDocIds,
  onOpenChange,
  onMergeComplete
}: MergeDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isConverting, 
    conversionProgress, 
    mergeImages 
  } = useDocumentConversion(() => {
    // This will be called when merge is complete
    onMergeComplete();
    
    // Reset state after a delay
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
    }, 1000);
  });

  // Filter out documents that are not images
  const imagesToMerge = documents.filter(doc => 
    selectedDocIds.includes(doc.id) && 
    doc.type.startsWith('image/')
  );

  const handleMergeImagesToPDF = async () => {
    if (selectedDocIds.length < 2) {
      toast.error('Select at least two images to merge');
      return;
    }

    if (imagesToMerge.length < 2) {
      toast.info('Select at least two images to merge');
      onOpenChange(false);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use the hook's mergeImages method which handles duplicate checking
      const result = await mergeImages(imagesToMerge);
      
      if (!result) {
        // If merge failed or was cancelled, reset state
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error merging images:', error);
      toast.error('Failed to merge images');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isConverting && !isProcessing) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Merge Images to PDF</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Combine multiple images into a single PDF document
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            You are about to merge {imagesToMerge.length} images into a single PDF document.
          </p>
          
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium">Selected images:</p>
            <ul className="text-sm text-muted-foreground max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
              {imagesToMerge.map(doc => (
                <li key={doc.id} className="flex items-center py-1">
                  <span className="w-4 h-4 mr-2 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {doc.name}
                </li>
              ))}
            </ul>
          </div>
          
          {isConverting && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Merging images...</span>
                <span>{Math.round(conversionProgress)}%</span>
              </div>
              <Progress value={conversionProgress} className="h-2" />
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConverting || isProcessing}
            className="rounded-md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMergeImagesToPDF}
            disabled={isConverting || isProcessing || imagesToMerge.length < 2}
            className="rounded-md"
          >
            {isConverting ? 'Merging...' : 'Merge Images'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 