# DocFlow Lite Architecture

This document provides a comprehensive overview of the DocFlow Lite application architecture, explaining the design decisions, component structure, and data flow.

## Architecture Overview

DocFlow Lite follows a modern React application architecture with a focus on client-side processing and storage. The application is built using a component-based approach with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Interface                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Components │  │  Features   │  │     Routes      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    Application Logic                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    Hooks    │  │  Utilities  │  │     Services    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                       Data Layer                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   LocalForage                        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Client-Side Processing**: All document processing happens in the browser, ensuring privacy and offline functionality.
2. **Component-Based Design**: UI is built from reusable components with clear responsibilities.
3. **Custom Hooks for Logic**: Business logic is encapsulated in custom hooks for reusability and separation of concerns.
4. **Local Storage**: All data is stored locally using IndexedDB via localForage.
5. **Feature-Based Organization**: Code is organized by feature rather than by technical type.

## Directory Structure

The application follows a feature-based directory structure:

```
app/
├── components/       # Reusable UI components
├── features/         # Feature-specific components
│   ├── document-list/
│   ├── document-viewer/
│   ├── document-upload/
│   ├── document-conversion/
│   └── document-merge/
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and services
│   ├── storage.ts    # Document storage service
│   ├── conversion.ts # Document conversion utilities
│   └── utils/        # General utilities
├── routes/           # Application routes
├── store/            # State management
├── types/            # TypeScript type definitions
├── app.css           # Global CSS
├── root.tsx          # Root component
└── routes.ts         # Route definitions
```

## Data Flow

### Document Management Flow

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│  User Action │────▶│  React Hook   │────▶│ Storage Layer │
└──────────────┘     └───────────────┘     └───────────────┘
       ▲                     │                     │
       │                     ▼                     │
       │              ┌───────────────┐            │
       └──────────────│   UI Update   │◀───────────┘
                      └───────────────┘
```

1. User initiates an action (upload, convert, merge, etc.)
2. The action is handled by a custom React hook
3. The hook interacts with the storage layer
4. The UI is updated based on the result
5. The user sees the updated state

### Document Processing Flow

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│  Document    │────▶│  Conversion   │────▶│  New Document │
│  Selection   │     │  Processing   │     │  Creation     │
└──────────────┘     └───────────────┘     └───────────────┘
                             │                     │
                             ▼                     ▼
                      ┌───────────────┐     ┌───────────────┐
                      │ Progress UI   │     │ Storage Layer │
                      └───────────────┘     └───────────────┘
                                                   │
                                                   ▼
                                            ┌───────────────┐
                                            │ Document List │
                                            │    Update     │
                                            └───────────────┘
```

## Key Components

### Storage Layer

The storage layer is built on top of localForage, which provides a simple API for storing and retrieving documents using IndexedDB. The main functions include:

- `saveDocument`: Stores a document and its metadata
- `getDocument`: Retrieves a document by ID
- `getAllDocuments`: Retrieves all document metadata
- `deleteDocument`: Removes a document from storage

### Document Conversion

Document conversion is handled by the conversion utilities, which provide functions for:

- Converting images to PDF
- Merging multiple images into a single PDF
- Creating PDF documents from various sources

### Custom Hooks

Custom hooks encapsulate the business logic and provide a clean API for components:

- `useDocuments`: Manages document listing, sorting, and basic operations
- `useDocumentConversion`: Handles document conversion operations
- `useDocumentUpload`: Manages the document upload process

## UI Component Hierarchy

```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Main Content
│       ├── DocumentsPage
│       │   ├── DocumentList
│       │   │   └── DocumentCard
│       │   └── DocumentUploadArea
│       ├── DocumentViewer
│       ├── ConversionDialog
│       └── MergeDialog
└── Modals and Dialogs
```

## State Management

DocFlow Lite uses React's built-in state management with custom hooks for managing application state. The main state categories include:

1. **Document List State**: Managed by the `useDocuments` hook
2. **Document Selection State**: Also managed by the `useDocuments` hook
3. **Conversion State**: Managed by the `useDocumentConversion` hook
4. **Upload State**: Managed by the `useDocumentUpload` hook

## Document Sorting Logic

The application implements custom sorting logic to organize documents in the document list:

1. Regular uploads (user-uploaded documents) appear at the start of the list, sorted by creation date with newest first
2. Generated documents (merged PDFs) appear at the end of the list, sorted by creation date with oldest first

This sorting logic is implemented in the `useDocuments` hook:

```typescript
const sortedDocs = [...docs].sort((a, b) => {
  // Check if documents are generated (merged PDFs or have isMergedDocument flag)
  const aIsGenerated = a.name.startsWith('merged-images-') || 
                      (a.metadata && a.metadata.isMergedDocument);
  const bIsGenerated = b.name.startsWith('merged-images-') || 
                      (b.metadata && b.metadata.isMergedDocument);
  
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

## Performance Considerations

1. **Lazy Loading**: Components are loaded only when needed
2. **Optimized Document Rendering**: Documents are rendered efficiently using appropriate techniques
3. **Efficient Storage**: Documents are stored efficiently using IndexedDB
4. **Progress Indicators**: Long-running operations show progress indicators

## Security Considerations

1. **Client-Side Only**: No data is sent to any server
2. **Local Storage**: All data remains in the user's browser
3. **No External Dependencies**: Minimal external dependencies to reduce security risks

## Future Architecture Considerations

1. **Cloud Sync**: Optional cloud synchronization for backup and sharing
2. **Worker Threads**: Moving heavy processing to web workers
3. **PWA Support**: Progressive Web App capabilities for offline use
4. **Advanced Document Processing**: OCR, annotations, and more 