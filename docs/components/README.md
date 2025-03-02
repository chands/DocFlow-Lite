# DocFlow Lite Component Library

This document provides an overview of the key components used in DocFlow Lite, their purpose, and how they are used.

## UI Component Architecture

DocFlow Lite uses a combination of custom components and components from the Shadcn UI library. The component architecture follows these principles:

1. **Composition over inheritance**: Components are composed from smaller, reusable pieces
2. **Single responsibility**: Each component has a clear, focused purpose
3. **Reusability**: Components are designed to be reusable across the application
4. **Consistency**: Components maintain consistent styling and behavior

## Core UI Components

### Layout Components

#### `Layout`

The main layout component that wraps the entire application.

**Location**: `app/components/Layout.tsx`

**Props**:
- `children`: React nodes to render within the layout

**Usage**:
```tsx
<Layout>
  <YourContent />
</Layout>
```

#### `Header`

The application header component that displays the logo, navigation, and theme toggle.

**Location**: `app/components/Header.tsx`

**Usage**:
```tsx
<Header />
```

### Document Management Components

#### `DocumentCard`

Displays a single document with actions.

**Location**: `app/features/document-list/DocumentCard.tsx`

**Props**:
- `document`: The document metadata
- `isSelected`: Whether the document is selected
- `onToggleSelect`: Function to toggle selection
- `onView`: Function to view the document
- `onDownload`: Function to download the document
- `onDelete`: Function to delete the document
- `onShare`: Function to share the document
- `onConvert`: Function to convert the document

**Usage**:
```tsx
<DocumentCard
  document={documentMeta}
  isSelected={isSelected}
  onToggleSelect={handleToggleSelect}
  onView={handleView}
  onDownload={handleDownload}
  onDelete={handleDelete}
  onShare={handleShare}
  onConvert={handleConvert}
/>
```

#### `DocumentList`

Displays a list of documents with selection and batch operations.

**Location**: `app/features/document-list/DocumentList.tsx`

**Usage**:
```tsx
<DocumentList />
```

#### `DocumentUploadArea`

Provides a drag-and-drop area for uploading documents.

**Location**: `app/features/document-upload/DocumentUploadArea.tsx`

**Props**:
- `onUploadComplete`: Function called when upload is complete

**Usage**:
```tsx
<DocumentUploadArea onUploadComplete={handleUploadComplete} />
```

#### `DocumentViewer`

Displays a document in a modal dialog with controls.

**Location**: `app/features/document-viewer/DocumentViewer.tsx`

**Props**:
- `open`: Whether the viewer is open
- `document`: The document to view (metadata and URL)
- `onOpenChange`: Function to handle open state changes
- `onDownload`: Function to download the document
- `onDelete`: Function to delete the document
- `onConvert`: Function to convert the document

**Usage**:
```tsx
<DocumentViewer
  open={viewerOpen}
  document={currentDocument}
  onOpenChange={setViewerOpen}
  onDownload={handleDownload}
  onDelete={handleDelete}
  onConvert={handleConvert}
/>
```

### Document Processing Components

#### `ConversionDialog`

Provides an interface for converting documents to different formats.

**Location**: `app/features/document-conversion/ConversionDialog.tsx`

**Props**:
- `open`: Whether the dialog is open
- `document`: The document to convert
- `initialFormat`: The initial conversion format
- `onOpenChange`: Function to handle open state changes
- `onConversionComplete`: Function called when conversion is complete

**Usage**:
```tsx
<ConversionDialog
  open={conversionDialogOpen}
  document={currentDocument}
  initialFormat="application/pdf"
  onOpenChange={setConversionDialogOpen}
  onConversionComplete={handleConversionComplete}
/>
```

#### `MergeDialog`

Provides an interface for merging multiple images into a PDF.

**Location**: `app/features/document-merge/MergeDialog.tsx`

**Props**:
- `open`: Whether the dialog is open
- `documents`: The documents to merge
- `onOpenChange`: Function to handle open state changes
- `onMergeComplete`: Function called when merge is complete

**Usage**:
```tsx
<MergeDialog
  open={mergeDialogOpen}
  documents={selectedDocuments}
  onOpenChange={setMergeDialogOpen}
  onMergeComplete={handleMergeComplete}
/>
```

### Feedback Components

#### `ProgressIndicator`

Displays a progress bar for long-running operations.

**Location**: `app/components/ProgressIndicator.tsx`

**Props**:
- `value`: The progress value (0-100)
- `showLabel`: Whether to show a percentage label

**Usage**:
```tsx
<ProgressIndicator value={conversionProgress} showLabel />
```

#### `EmptyState`

Displays a message when there are no items to show.

**Location**: `app/components/EmptyState.tsx`

**Props**:
- `title`: The title to display
- `description`: The description to display
- `icon`: The icon to display
- `action`: Optional action button

**Usage**:
```tsx
<EmptyState
  title="No documents"
  description="Upload documents to get started"
  icon={<FileIcon />}
  action={<Button>Upload</Button>}
/>
```

## Shadcn UI Components

DocFlow Lite uses several components from the Shadcn UI library:

### Dialog Components

- `Dialog`: Modal dialog container
- `DialogContent`: Content container for dialogs
- `DialogHeader`: Header for dialogs
- `DialogTitle`: Title for dialogs
- `DialogDescription`: Description for dialogs
- `DialogFooter`: Footer for dialogs

### Button Components

- `Button`: Standard button component
- `ButtonGroup`: Group of related buttons

### Form Components

- `Input`: Text input field
- `Label`: Form label
- `Select`: Dropdown select
- `Checkbox`: Checkbox input

### Feedback Components

- `Progress`: Progress bar
- `Alert`: Alert message
- `Toast`: Toast notification

### Layout Components

- `Card`: Card container
- `Tabs`: Tabbed interface

## Component Customization

### Theme Customization

DocFlow Lite uses TailwindCSS for styling, with customizations defined in the `tailwind.config.js` file. The application supports both light and dark modes.

### Component Variants

Many components support variants for different visual styles:

- `Button` variants: `default`, `outline`, `ghost`, `link`, `destructive`
- `Card` variants: `default`, `outline`
- `Alert` variants: `default`, `destructive`, `warning`, `success`

## Component Best Practices

1. **Use composition**: Compose complex components from simpler ones
2. **Keep components focused**: Each component should have a single responsibility
3. **Use TypeScript interfaces**: Define clear prop interfaces for components
4. **Document components**: Add JSDoc comments to explain component purpose and usage
5. **Use Shadcn UI when possible**: Leverage existing components rather than creating custom ones
6. **Follow naming conventions**: Use PascalCase for component names and camelCase for props
7. **Implement responsive design**: Ensure components work well on all screen sizes

## Adding New Components

When adding new components to DocFlow Lite:

1. Determine if a Shadcn UI component can be used or adapted
2. Create a new file in the appropriate directory
3. Define a clear TypeScript interface for props
4. Implement the component with proper TypeScript typing
5. Add JSDoc comments to document the component
6. Export the component as a named export
7. Update this documentation if the component is significant 