# DocFlow Lite Changelog

## Latest Updates

### Documentation Improvements
- Added comprehensive project documentation structure
- Created detailed architecture documentation in `docs/architecture/README.md`
- Added component documentation in `docs/components/README.md`
- Added API documentation in `docs/api/README.md`
- Added feature documentation in `docs/features/README.md`
- Updated main `README.md` with project overview
- Updated `PLAN.md` with implementation status
- Added `CHANGELOG.md` to track all improvements and fixes
- Added `FIXES.md` to document specific issues and their solutions

### Document Sorting Enhancements
- Modified sorting logic in `useDocuments.ts` to prioritize regular uploads
- Added custom sorting for newly uploaded documents
- Improved metadata tracking for generated documents
- Updated sorting logic to treat both merged PDFs and converted PDFs as generated documents
- Added `isGeneratedDocument` flag to converted PDFs for consistent sorting

### Document Conversion Improvements
- Enhanced `convertToPDF` function to include metadata tracking
- Added source document tracking for converted PDFs
- Improved progress simulation during conversion
- Modified `convertDocument` function to mark converted PDFs as generated documents
- Added detailed metadata to converted PDFs including source document information

### Document Merging Fixes
- Fixed issue with duplicate document creation during image merges
- Enhanced `mergeImagesToPDF` function to properly handle metadata
- Improved refresh mechanism after merge operations
- Added proper progress tracking during merge operations

### UI Enhancements
- Fixed overlapping buttons in the DocumentViewer component
- Improved dialog styling with rounded corners for better visual appeal
- Enhanced MergeDialog UI with consistent styling
- Fixed document upload refresh issues
- Improved mobile responsiveness across all components
- Added consistent styling for all dialogs and modals

### Bug Fixes
- Fixed issue with document list not refreshing after uploads
- Resolved duplicate close button in DocumentViewer
- Fixed document upload area to ensure single call to onUploadComplete
- Corrected mergeImages function to prevent duplicate document creation
- Improved error handling throughout the application

## Previous Updates

### Initial Features
- Implemented drag-and-drop document upload functionality
- Created document preview with basic controls
- Added image to PDF conversion capability
- Implemented multiple image merging to PDF
- Added dark/light mode support
- Created responsive design for all screen sizes
- Implemented client-side storage using localForage
- Added progress indicators for document processing operations 