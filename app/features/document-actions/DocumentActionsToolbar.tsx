import { Button } from "~/components/ui/button";
import { 
  FileIcon, 
  FileTextIcon, 
  ImageIcon, 
  DownloadIcon, 
  TrashIcon, 
  Share2Icon, 
  CheckSquareIcon, 
  SquareIcon,
  MoveIcon
} from "lucide-react";
import type { DocumentMeta } from "~/lib/storage";

interface DocumentActionsToolbarProps {
  documents: DocumentMeta[];
  selectedDocIds: string[];
  onSelectAll: () => void;
  onConvertToPdf: () => void;
  onMergeImages: () => void;
  hasImageSelection: boolean;
  hasNonPdfSelection: boolean;
}

/**
 * Toolbar component for document actions like select all, convert to PDF, etc.
 */
export function DocumentActionsToolbar({
  documents,
  selectedDocIds,
  onSelectAll,
  onConvertToPdf,
  onMergeImages,
  hasImageSelection,
  hasNonPdfSelection
}: DocumentActionsToolbarProps) {
  const allSelected = documents.length > 0 && selectedDocIds.length === documents.length;
  const hasSelection = selectedDocIds.length > 0;
  const multipleImagesSelected = hasImageSelection && selectedDocIds.length >= 2;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        className="flex items-center gap-1"
        title={allSelected ? "Deselect all documents" : "Select all documents"}
      >
        {allSelected ? (
          <CheckSquareIcon className="h-4 w-4" />
        ) : (
          <SquareIcon className="h-4 w-4" />
        )}
        {allSelected ? "Deselect All" : "Select All"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onConvertToPdf}
        disabled={!hasNonPdfSelection}
        className="flex items-center gap-1"
        title={hasNonPdfSelection
          ? "Convert selected documents to PDF"
          : "Select non-PDF documents to convert"}
      >
        <FileTextIcon className="h-4 w-4" />
        Convert to PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onMergeImages}
        disabled={!multipleImagesSelected}
        className="flex items-center gap-1"
        title={multipleImagesSelected
          ? "Merge selected images into a single PDF"
          : "Select at least 2 images to merge"}
      >
        <MoveIcon className="h-4 w-4" />
        Merge Images
      </Button>
    </div>
  );
} 