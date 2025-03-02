import { useState, useEffect } from 'react';
import type { DocumentMeta } from '~/lib/storage';
import { CONVERSION_FORMATS, FORMAT_MAP } from '~/lib/conversion';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { DocumentCard } from "./DocumentCard";
import { DocumentActionsToolbar } from "~/features/document-actions/DocumentActionsToolbar";
import { useDocuments } from "~/lib/hooks/useDocuments";
import { useDocumentConversion } from "~/lib/hooks/useDocumentConversion";
import { BatchConversionDialog } from "~/features/document-conversion/BatchConversionDialog";
import { MergeDialog } from "~/features/document-merge/MergeDialog";
import { DocumentViewer } from "~/features/document-viewer/DocumentViewer";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog";

interface DocumentListProps {
  documents: DocumentMeta[];
  isLoading: boolean;
  selectedDocIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onViewDocument: (id: string) => void;
  onDownloadDocument: (id: string) => void;
  onShareDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onConvertDocument: (id: string, format?: string) => void;
  onOpenBatchConversion: () => void;
  onOpenMergeDialog: () => void;
}

export function DocumentList() {
  const {
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
  } = useDocuments();

  // Force reload documents when component mounts
  useEffect(() => {
    console.log('DocumentList mounted, loading documents');
    loadDocuments();
  }, [loadDocuments]);

  const {
    isConverting,
    conversionProgress,
    convertToPDF,
    batchConvertToPDF,
    mergeImages
  } = useDocumentConversion(loadDocuments);

  const [showBatchConvertDialog, setShowBatchConvertDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{ meta: DocumentMeta; url: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentMeta | null>(null);

  // Check if there are any non-PDF documents selected
  const hasNonPdfSelection = selectedDocIds.some(id => {
    const doc = documents.find(d => d.id === id);
    return doc && doc.type !== 'application/pdf';
  });

  // Check if there are any image documents selected
  const hasImageSelection = selectedDocIds.some(id => {
    const doc = documents.find(d => d.id === id);
    return doc && doc.type.startsWith('image/');
  });

  // Handle viewing a document
  const handleViewDocument = async (id: string) => {
    const doc = await viewDocument(id);
    if (doc) {
      setCurrentDocument(doc);
      setViewerOpen(true);
    }
  };

  // Handle downloading the current document
  const handleDownloadCurrentDocument = () => {
    if (currentDocument) {
      downloadDocument(currentDocument.meta.id);
    }
  };

  // Handle deleting a document with confirmation
  const handleDeleteDocument = (document: DocumentMeta) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Confirm document deletion
  const confirmDeleteDocument = async () => {
    if (documentToDelete) {
      await removeDocument(documentToDelete.id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  // Handle converting a single document to PDF
  const handleConvertDocument = async (document: DocumentMeta) => {
    await convertToPDF(document);
  };

  // Handle batch conversion to PDF
  const handleBatchConvertToPDF = () => {
    if (hasNonPdfSelection) {
      setShowBatchConvertDialog(true);
    }
  };

  // Handle merging images to PDF
  const handleMergeImages = () => {
    if (hasImageSelection && selectedDocIds.length >= 2) {
      setShowMergeDialog(true);
    }
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Render empty state
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No documents found. Upload some documents to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DocumentActionsToolbar
        documents={documents}
        selectedDocIds={selectedDocIds}
        onSelectAll={selectAllDocuments}
        onConvertToPdf={handleBatchConvertToPDF}
        onMergeImages={handleMergeImages}
        hasImageSelection={hasImageSelection}
        hasNonPdfSelection={hasNonPdfSelection}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            isSelected={selectedDocIds.includes(document.id)}
            onToggleSelect={toggleDocumentSelection}
            onView={handleViewDocument}
            onDownload={downloadDocument}
            onDelete={() => handleDeleteDocument(document)}
            onShare={shareDocument}
            onConvert={handleConvertDocument}
          />
        ))}
      </div>

      <BatchConversionDialog
        open={showBatchConvertDialog}
        onOpenChange={setShowBatchConvertDialog}
        documents={documents}
        selectedDocIds={selectedDocIds}
        onConversionComplete={() => {
          loadDocuments();
          clearSelection();
        }}
      />

      <MergeDialog
        open={showMergeDialog}
        onOpenChange={setShowMergeDialog}
        documents={documents}
        selectedDocIds={selectedDocIds}
        onMergeComplete={() => {
          loadDocuments();
          clearSelection();
        }}
      />

      {currentDocument && (
        <DocumentViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          document={currentDocument}
          onDownload={handleDownloadCurrentDocument}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-end gap-2">
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDocument}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 