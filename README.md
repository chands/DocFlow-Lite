# DocFlow Lite

A lightweight, browser-based document management application that allows users to manage, combine, and organize documents without server dependencies.

## Overview

DocFlow Lite is designed to provide a simple, efficient way to handle document management tasks directly in the browser. It focuses on client-side processing, ensuring privacy and offline functionality.

![DocFlow Lite Screenshot](public/screenshot.png)

## Features

- 📄 **Document Upload & Management**
  - Drag-and-drop interface for uploading documents (PDF, images)
  - Document preview and organization
  - Intuitive document list with sorting options

- 🔄 **Document Processing**
  - Convert images to PDF format
  - Merge multiple images into a single PDF
  - View documents in a clean, distraction-free interface

- 💾 **Client-side Storage**
  - All documents stored locally in your browser
  - No server uploads, ensuring privacy
  - Works offline with IndexedDB/localForage

- 🎨 **Modern User Experience**
  - Responsive design for desktop and mobile
  - Dark/light mode support
  - Intuitive UI with minimal learning curve

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/docflow-lite.git
cd docflow-lite
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Uploading Documents

1. Navigate to the Documents page
2. Drag and drop files into the upload area or click to select files
3. Supported formats: PDF, PNG, JPEG, WebP

### Converting Images to PDF

1. Select an image document from your list
2. Click the "PDF" button to convert it
3. The converted PDF will appear in your document list

### Merging Images

1. Select multiple image documents using the checkboxes
2. Click the "Merge Selected" button
3. The merged PDF will be created and added to your document list

### Document Management

- **View**: Click on a document to open it in the viewer
- **Download**: Use the download button to save a document to your device
- **Delete**: Remove documents you no longer need
- **Share**: Share documents using the Web Share API (if supported by your browser)

## Technical Stack

- **Framework**: React with React Router 7
- **Build Tool**: Vite
- **Styling**: TailwindCSS with Shadcn UI components
- **Storage**: localForage (wrapper for IndexedDB)
- **PDF Processing**: Custom PDF generation and manipulation

## Project Structure

```
docflow-lite/
├── app/                  # Application code
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   ├── routes/           # Application routes
│   ├── store/            # State management
│   ├── types/            # TypeScript type definitions
│   ├── app.css           # Global CSS
│   ├── root.tsx          # Root component
│   └── routes.ts         # Route definitions
├── docs/                 # Documentation
├── public/               # Static assets
└── ...config files
```

## Documentation

For more detailed documentation, please refer to the [docs](./docs) directory:

- [Architecture Overview](./docs/architecture/README.md)
- [Feature Documentation](./docs/features/README.md)
- [Component Library](./docs/components/README.md)
- [API Reference](./docs/api/README.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Router](https://reactrouter.com/) for routing
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [TailwindCSS](https://tailwindcss.com/) for styling
- [localForage](https://localforage.github.io/localForage/) for storage
