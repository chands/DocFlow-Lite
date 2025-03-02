import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  FileIcon, 
  FileTextIcon, 
  ImageIcon, 
  DownloadIcon, 
  TrashIcon, 
  Share2Icon, 
  CheckSquareIcon, 
  SquareIcon 
} from "lucide-react";
import { formatDate, formatFileSize } from "~/lib/utils/format-utils";
import type { DocumentMeta } from "~/lib/storage";

interface DocumentCardProps {
  document: DocumentMeta;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onConvert: (document: DocumentMeta) => void;
}

/**
 * Card component for displaying a document in the document list
 */
export function DocumentCard({
  document,
  isSelected,
  onToggleSelect,
  onView,
  onDownload,
  onDelete,
  onShare,
  onConvert
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPdf = document.type === "application/pdf";
  const isImage = document.type.startsWith("image/");
  
  // Get the appropriate icon based on document type
  const getDocumentIcon = () => {
    if (isPdf) return <FileTextIcon className="h-6 w-6 text-blue-500" />;
    if (isImage) return <ImageIcon className="h-6 w-6 text-green-500" />;
    return <FileIcon className="h-6 w-6 text-gray-500" />;
  };
  
  return (
    <Card 
      className={`p-4 relative card-hover-effect transition-all ${
        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
      } ${isHovered ? "shadow-md" : "shadow-sm"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox column */}
        <div 
          className="flex-shrink-0 cursor-pointer mt-1" 
          onClick={() => onToggleSelect(document.id)}
          aria-label={isSelected ? "Deselect document" : "Select document"}
        >
          {isSelected ? (
            <CheckSquareIcon className="h-5 w-5 text-blue-500" />
          ) : (
            <SquareIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {/* Document icon column */}
        <div className="flex-shrink-0 mt-1">
          {getDocumentIcon()}
        </div>
        
        {/* Document info column */}
        <div className="flex-grow min-w-0">
          <div 
            className="font-medium text-base truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => onView(document.id)}
            title={document.name}
          >
            {document.name}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatFileSize(document.size)} • {formatDate(document.lastModified)}
          </div>
          
          <div className="flex mt-3 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-full"
              onClick={() => onView(document.id)}
              title="View document"
            >
              <FileIcon className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-full"
              onClick={() => onDownload(document.id)}
              title="Download document"
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-full"
              onClick={() => onShare(document.id)}
              title="Share document"
            >
              <Share2Icon className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onDelete(document.id)}
              title="Delete document"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            
            {!isPdf && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs cursor-pointer"
                onClick={() => onConvert(document)}
                title="Convert to PDF"
              >
                <FileTextIcon className="h-4 w-4 mr-1" />
                PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 