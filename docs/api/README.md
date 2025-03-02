# DocFlow Lite API Documentation

This document provides detailed information about the internal APIs and hooks used in DocFlow Lite.

## Storage API

DocFlow Lite uses a client-side storage system built on IndexedDB (via localForage) to store documents and metadata.

### `app/lib/storage/documentStorage.ts`

#### `saveDocument`

Saves a document to local storage.

```typescript
async function saveDocument(
  document: DocumentFile,
  metadata?: Partial<DocumentMetadata>
): Promise<DocumentMetadata>
```

**Parameters:**
- `document`: The document file to save
- `metadata` (optional): Additional metadata to store with the document

**Returns:**
- A promise that resolves to the saved document metadata

#### `getDocuments`

Retrieves all documents from storage.

```typescript
async function getDocuments(): Promise<DocumentMetadata[]>
```

**Returns:**
- A promise that resolves to an array of document metadata

#### `getDocumentById`

Retrieves a specific document by ID.

```typescript
async function getDocumentById(id: string): Promise<DocumentMetadata | null>
```

**Parameters:**
- `id`: The ID of the document to retrieve

**Returns:**
- A promise that resolves to the document metadata or null if not found

#### `getDocumentFile`

Retrieves the file data for a document.

```typescript
async function getDocumentFile(id: string): Promise<Blob | null>
```

**Parameters:**
- `id`: The ID of the document to retrieve

**Returns:**
- A promise that resolves to the document file as a Blob or null if not found

#### `deleteDocument`

Deletes a document from storage.

```typescript
async function deleteDocument(id: string): Promise<boolean>
```

**Parameters:**
- `id`: The ID of the document to delete

**Returns:**
- A promise that resolves to true if the document was deleted, false otherwise

#### `updateDocumentMetadata`

Updates the metadata for a document.

```typescript
async function updateDocumentMetadata(
  id: string,
  metadata: Partial<DocumentMetadata>
): Promise<DocumentMetadata | null>
```

**Parameters:**
- `id`: The ID of the document to update
- `metadata`: The metadata fields to update

**Returns:**
- A promise that resolves to the updated document metadata or null if not found

## Document Processing API

### `app/lib/document/pdfUtils.ts`

#### `convertImageToPdf`

Converts an image to a PDF document.

```typescript
async function convertImageToPdf(
  imageBlob: Blob,
  options?: PDFConversionOptions
): Promise<Blob>
```

**Parameters:**
- `imageBlob`: The image blob to convert
- `options` (optional): Conversion options like page size, margins, etc.

**Returns:**
- A promise that resolves to the PDF blob

#### `mergeImagesToPDF`

Merges multiple images into a single PDF document.

```typescript
async function mergeImagesToPDF(
  imageBlobs: Blob[],
  options?: PDFMergeOptions,
  metadata?: DocumentMetadata
): Promise<Blob>
```

**Parameters:**
- `imageBlobs`: Array of image blobs to merge
- `options` (optional): Merge options like page size, margins, etc.
- `metadata` (optional): Metadata to include in the merged document

**Returns:**
- A promise that resolves to the merged PDF blob

### `app/lib/document/fileUtils.ts`

#### `getFileExtension`

Gets the file extension from a filename.

```typescript
function getFileExtension(filename: string): string
```

**Parameters:**
- `filename`: The filename to extract the extension from

**Returns:**
- The file extension (without the dot)

#### `getMimeType`

Gets the MIME type for a file based on its extension.

```typescript
function getMimeType(filename: string): string
```

**Parameters:**
- `filename`: The filename to get the MIME type for

**Returns:**
- The MIME type string

#### `isImageFile`

Checks if a file is an image based on its MIME type.

```typescript
function isImageFile(mimeType: string): boolean
```

**Parameters:**
- `mimeType`: The MIME type to check

**Returns:**
- `true` if the file is an image, `false` otherwise

#### `isPdfFile`

Checks if a file is a PDF based on its MIME type.

```typescript
function isPdfFile(mimeType: string): boolean
```

**Parameters:**
- `mimeType`: The MIME type to check

**Returns:**
- `true` if the file is a PDF, `false` otherwise

## Custom React Hooks

### `app/lib/hooks/useDocuments.ts`

#### `useDocuments`

A hook for managing documents in the application.

```typescript
function useDocuments(): {
  documents: DocumentMetadata[];
  isLoading: boolean;
  error: Error | null;
  refreshDocuments: () => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string) => Promise<void>;
}
```

**Returns:**
- `documents`: Array of document metadata
- `isLoading`: Boolean indicating if documents are being loaded
- `error`: Error object if an error occurred, null otherwise
- `refreshDocuments`: Function to refresh the document list
- `deleteDocument`: Function to delete a document
- `downloadDocument`: Function to download a document

### `app/lib/hooks/useDocumentUpload.ts`

#### `useDocumentUpload`

A hook for handling document uploads.

```typescript
function useDocumentUpload(): {
  uploadDocument: (file: File, metadata?: Partial<DocumentMetadata>) => Promise<DocumentMetadata>;
  uploadProgress: number;
  isUploading: boolean;
  error: Error | null;
}
```

**Returns:**
- `uploadDocument`: Function to upload a document
- `uploadProgress`: Number indicating upload progress (0-100)
- `isUploading`: Boolean indicating if an upload is in progress
- `error`: Error object if an error occurred, null otherwise

### `app/lib/hooks/useDocumentConversion.ts`

#### `useDocumentConversion`

A hook for converting documents between formats.

```typescript
function useDocumentConversion(): {
  convertToPDF: (document: DocumentMetadata) => Promise<DocumentMetadata>;
  conversionProgress: number;
  isConverting: boolean;
  error: Error | null;
}
```

**Returns:**
- `convertToPDF`: Function to convert a document to PDF
- `conversionProgress`: Number indicating conversion progress (0-100)
- `isConverting`: Boolean indicating if a conversion is in progress
- `error`: Error object if an error occurred, null otherwise

### `app/lib/hooks/useDocumentMerge.ts`

#### `useDocumentMerge`

A hook for merging multiple documents.

```typescript
function useDocumentMerge(): {
  mergeImages: (documents: DocumentMetadata[]) => Promise<DocumentMetadata>;
  mergeProgress: number;
  isMerging: boolean;
  error: Error | null;
}
```

**Returns:**
- `mergeImages`: Function to merge multiple images into a PDF
- `mergeProgress`: Number indicating merge progress (0-100)
- `isMerging`: Boolean indicating if a merge is in progress
- `error`: Error object if an error occurred, null otherwise

## Type Definitions

### `app/types/document.ts`

#### `DocumentMetadata`

```typescript
interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  createdAt: number;
  url: string;
  thumbnailUrl?: string;
  isGeneratedDocument?: boolean;
  sourceDocumentId?: string;
  conversionType?: string;
}
```

#### `DocumentFile`

```typescript
interface DocumentFile {
  id?: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: Blob;
}
```

#### `PDFConversionOptions`

```typescript
interface PDFConversionOptions {
  pageSize?: string; // 'A4', 'letter', etc.
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality?: number; // 0-1
}
```

#### `PDFMergeOptions`

```typescript
interface PDFMergeOptions extends PDFConversionOptions {
  filename?: string;
}
```

## Error Handling

### `app/lib/errors/documentErrors.ts`

#### `DocumentError`

Base error class for document-related errors.

```typescript
class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentError';
  }
}
```

#### `DocumentNotFoundError`

Error thrown when a document is not found.

```typescript
class DocumentNotFoundError extends DocumentError {
  constructor(id: string) {
    super(`Document with ID ${id} not found`);
    this.name = 'DocumentNotFoundError';
  }
}
```

#### `DocumentStorageError`

Error thrown when there's an issue with document storage.

```typescript
class DocumentStorageError extends DocumentError {
  constructor(message: string) {
    super(`Storage error: ${message}`);
    this.name = 'DocumentStorageError';
  }
}
```

#### `DocumentConversionError`

Error thrown when there's an issue with document conversion.

```typescript
class DocumentConversionError extends DocumentError {
  constructor(message: string) {
    super(`Conversion error: ${message}`);
    this.name = 'DocumentConversionError';
  }
}
```

## Event System

### `app/lib/events/documentEvents.ts`

#### `DocumentEventTypes`

Enum of document event types.

```typescript
enum DocumentEventTypes {
  DOCUMENT_CREATED = 'document:created',
  DOCUMENT_UPDATED = 'document:updated',
  DOCUMENT_DELETED = 'document:deleted',
  DOCUMENT_CONVERTED = 'document:converted',
  DOCUMENT_MERGED = 'document:merged'
}
```

#### `DocumentEventEmitter`

Event emitter for document events.

```typescript
const documentEvents = new EventEmitter();

// Subscribe to events
documentEvents.on(DocumentEventTypes.DOCUMENT_CREATED, (document: DocumentMetadata) => {
  // Handle document created
});

// Emit events
documentEvents.emit(DocumentEventTypes.DOCUMENT_CREATED, documentMetadata);
``` 