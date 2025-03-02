# DocFlow Lite Features

This document provides detailed information about the features available in DocFlow Lite, including how they work and how to use them.

## Core Features

### Document Management

#### Document Upload

The document upload feature allows users to add documents to the application through a drag-and-drop interface or file selection dialog.

**Implementation Details:**
- Located in `app/features/document-upload/DocumentUploadArea.tsx`
- Uses the HTML5 File API for handling file uploads
- Supports PDF, PNG, JPEG, and WebP formats
- Files are stored in IndexedDB using localForage

**Usage:**
1. Navigate to the Documents page
2. Drag and drop files into the upload area or click to select files
3. Files are automatically uploaded and added to the document list

#### Document List

The document list displays all uploaded documents with sorting and filtering capabilities.

**Implementation Details:**
- Located in `app/features/document-list/DocumentList.tsx`
- Uses the `useDocuments` hook for document management
- Implements custom sorting logic to prioritize regular uploads over generated documents
- Generated documents include both merged PDFs and converted PDFs
- Displays document metadata including name, type, and size
- Supports selection of multiple documents for batch operations

**Usage:**
- Documents are automatically sorted with regular uploads appearing first
- Generated documents (merged PDFs and converted PDFs) appear at the end of the list
- Click on a document to view it
- Use the checkbox to select multiple documents for batch operations
- Right-click on a document to access additional options

**Sorting Logic:**
```typescript
// Custom sorting logic in useDocuments.ts
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
```

#### Document Viewer

The document viewer provides a clean, distraction-free interface for viewing documents.

**Implementation Details:**
- Located in `app/features/document-viewer/DocumentViewer.tsx`
- Uses appropriate viewers based on document type (PDF viewer, image viewer)
- Implements zoom, rotate, and navigation controls
- Provides a modal interface for focused viewing

**Usage:**
1. Click on a document in the document list
2. The viewer opens in a modal dialog
3. Use the controls to navigate, zoom, or rotate the document
4. Close the viewer to return to the document list

### Document Processing

#### Image to PDF Conversion

Users can convert images to PDF format with a single click.

**Implementation Details:**
- Located in `app/features/document-conversion/DocumentConversionButton.tsx`
- Uses the `useDocumentConversion` hook for conversion logic
- Implements the `convertToPDF` function to handle the conversion process
- Adds metadata to converted PDFs to mark them as generated documents
- Converted PDFs include source document information in their metadata
- Displays progress indicators during conversion

**Metadata Added to Converted PDFs:**
```typescript
// Metadata added to converted PDFs
{
  isGeneratedDocument: true,
  sourceDocumentId: sourceMeta.id,
  sourceDocumentName: sourceMeta.name,
  sourceDocumentType: sourceMeta.type,
  conversionTimestamp: Date.now()
}
```

**Usage:**
- Select an image document from the document list
- Click the "Convert to PDF" button
- The conversion process will start with a progress indicator
- Once complete, the PDF will appear in the document list as a generated document
- Generated documents are sorted to appear after regular uploads

#### Image Merging

Users can combine multiple images into a single PDF document.

**Implementation Details:**
- Located in `app/features/document-merge/MergeDialog.tsx`
- Uses the `useDocumentConversion` hook for merging logic
- Implements the `mergeImages` function to handle the merging process
- Adds metadata to merged PDFs to mark them as generated documents
- Merged PDFs include source document information in their metadata
- Displays progress indicators during merging

**Metadata Added to Merged PDFs:**
```typescript
// Metadata added to merged PDFs
{
  sourceImageIds: imageDocuments.map(doc => doc.id),
  mergeSetIdentifier,
  isMergedDocument: true,
  createdAt: Date.now()
}
```

**Usage:**
- Select multiple image documents from the document list
- Click the "Merge to PDF" button
- The merge dialog will open showing selected images
- Rearrange images if needed
- Click "Merge" to start the process
- Once complete, the merged PDF will appear in the document list as a generated document
- Generated documents are sorted to appear after regular uploads

#### Document Conversion Dialog

A dialog interface for converting documents to different formats.

**Implementation Details:**
- Located in `app/features/document-conversion/BatchConversionDialog.tsx`
- Uses the `useDocumentConversion` hook for batch conversion
- Implements the `batchConvertToPDF` function for multiple documents
- Adds metadata to converted PDFs to mark them as generated documents
- Displays progress indicators during conversion
- Handles errors and provides user feedback

**Usage:**
- Select multiple documents from the document list
- Click the "Batch Convert" button
- The conversion dialog will open showing selected documents
- Choose the target format (currently only PDF is supported)
- Click "Convert" to start the process
- Once complete, the converted documents will appear in the document list as generated documents
- Generated documents are sorted to appear after regular uploads

### User Experience

#### Responsive Design

The application is designed to work on various screen sizes, from mobile to desktop.

**Implementation Details:**
- Uses TailwindCSS for responsive styling
- Implements mobile-first approach
- Adapts layouts based on screen size
- Ensures touch-friendly controls on mobile devices

#### Dark/Light Mode

The application supports both dark and light color schemes.

**Implementation Details:**
- Uses TailwindCSS dark mode
- Respects user system preferences
- Provides consistent styling across modes
- Ensures proper contrast and readability

#### Progress Indicators

Long-running operations show progress indicators to provide feedback to users.

**Implementation Details:**
- Uses the Progress component from Shadcn UI
- Simulates progress for operations where exact progress is difficult to determine
- Provides visual feedback for background operations

## Technical Features

### Client-Side Storage

All documents are stored locally in the browser using IndexedDB via localForage.

**Implementation Details:**
- Located in `app/lib/storage.ts`
- Uses localForage as a wrapper for IndexedDB
- Implements CRUD operations for documents
- Handles metadata separately from document data

### Custom Hooks

The application uses custom React hooks to encapsulate business logic.

**Key Hooks:**
- `useDocuments`: Manages document listing, sorting, and basic operations
- `useDocumentConversion`: Handles document conversion operations
- `useDocumentUpload`: Manages the document upload process

### PDF Generation

The application includes custom PDF generation capabilities.

**Implementation Details:**
- Located in `app/lib/conversion.ts`
- Implements low-level PDF generation without external libraries
- Supports image embedding and multi-page documents
- Handles various image formats

## Feature Roadmap

### Planned Features

1. **Document Annotations**
   - Add text, highlights, and drawings to documents
   - Save annotations with documents
   - Export annotated documents

2. **Advanced PDF Operations**
   - PDF page extraction
   - PDF page reordering
   - PDF form filling

3. **Document Categories and Tags**
   - Organize documents with categories
   - Add tags for better searchability
   - Filter documents by category or tag

4. **Search Functionality**
   - Full-text search for document content
   - Search by metadata (name, type, date)
   - Advanced search filters

5. **Export/Import**
   - Export documents and metadata for backup
   - Import previously exported documents
   - Batch export/import operations 