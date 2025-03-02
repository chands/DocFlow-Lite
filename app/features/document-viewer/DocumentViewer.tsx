import { useEffect, useState } from "react";
import { Dialog, DialogContent as ShadcnDialogContent, DialogTitle, DialogClose } from "~/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "~/components/ui/button";
import { DownloadIcon, MaximizeIcon, MinimizeIcon, XIcon } from "lucide-react";
import type { DocumentMeta } from "~/lib/storage";
import { cn } from "~/lib/utils";

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: { meta: DocumentMeta; url: string };
  onDownload: () => void;
}

// Custom DialogContent without the default close button
const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      className={cn(
        "bg-background fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200",
        "rounded-lg overflow-hidden",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

/**
 * Component for viewing documents in a dialog
 */
export function DocumentViewer({
  open,
  onOpenChange,
  document,
  onDownload
}: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };
    
    window.document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      window.document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const viewerElement = window.document.getElementById("document-viewer");
    
    if (!viewerElement) return;
    
    if (!isFullscreen) {
      if (viewerElement.requestFullscreen) {
        viewerElement.requestFullscreen();
      }
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      }
    }
  };
  
  // Determine the appropriate viewer based on document type
  const renderDocumentViewer = () => {
    const { meta, url } = document;
    
    if (meta.type === "application/pdf") {
      return (
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-full border-0"
          title={meta.name}
        />
      );
    } else if (meta.type.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={meta.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            Preview not available for this file type
          </p>
        </div>
      );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0"
      >
        {/* Header with title and buttons */}
        <div className="p-4 border-b flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800">
          <DialogTitle className="truncate max-w-[60%] text-lg">
            {document.meta.name}
          </DialogTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 cursor-pointer rounded-md"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <MinimizeIcon className="h-4 w-4" />
              ) : (
                <MaximizeIcon className="h-4 w-4" />
              )}
              <span className="sr-only">{isFullscreen ? "Exit" : "Enter"} fullscreen</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-1 cursor-pointer mr-2 rounded-md"
              title="Download document"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download</span>
            </Button>
            
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Close"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
        
        <div
          id="document-viewer"
          className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900"
        >
          {renderDocumentViewer()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 