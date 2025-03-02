import localforage from 'localforage';

// Initialize localForage
localforage.config({
  name: 'DocFlowLite',
  storeName: 'documents',
  description: 'Storage for DocFlow Lite documents'
});

// Document metadata type
export interface DocumentMeta {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  createdAt: number;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
}

// Save a document to storage
export async function saveDocument(file: File): Promise<DocumentMeta> {
  // Create a unique ID for the document
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Read the file as an ArrayBuffer
  const fileData = await readFileAsArrayBuffer(file);
  
  // Create metadata
  const meta: DocumentMeta = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    createdAt: Date.now()
  };
  
  // Store the file data
  await localforage.setItem(`file:${id}`, fileData);
  
  // Store the metadata
  await localforage.setItem(`meta:${id}`, meta);
  
  // Update the document list
  await addToDocumentList(id);
  
  return meta;
}

// Get all document metadata
export async function getAllDocuments(): Promise<DocumentMeta[]> {
  const docList = await getDocumentList();
  console.log('Document list from storage:', docList);
  
  const documents: DocumentMeta[] = [];
  
  for (const id of docList) {
    const meta = await localforage.getItem<DocumentMeta>(`meta:${id}`);
    if (meta) {
      documents.push(meta);
    }
  }
  
  console.log('Retrieved documents:', documents);
  return documents;
}

// Get a document by ID
export async function getDocument(id: string): Promise<{ meta: DocumentMeta, data: ArrayBuffer } | null> {
  const meta = await localforage.getItem<DocumentMeta>(`meta:${id}`);
  const data = await localforage.getItem<ArrayBuffer>(`file:${id}`);
  
  if (!meta || !data) {
    return null;
  }
  
  return { meta, data };
}

// Delete a document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    await localforage.removeItem(`file:${id}`);
    await localforage.removeItem(`meta:${id}`);
    await removeFromDocumentList(id);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// Update document metadata
export async function updateDocumentMeta(id: string, updates: Partial<DocumentMeta>): Promise<DocumentMeta | null> {
  const meta = await localforage.getItem<DocumentMeta>(`meta:${id}`);
  
  if (!meta) {
    return null;
  }
  
  const updatedMeta = { ...meta, ...updates };
  await localforage.setItem(`meta:${id}`, updatedMeta);
  
  return updatedMeta;
}

// Helper function to read a file as ArrayBuffer
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to get the document list
async function getDocumentList(): Promise<string[]> {
  const list = await localforage.getItem<string[]>('documentList');
  return list || [];
}

// Helper function to add a document to the list
async function addToDocumentList(id: string): Promise<void> {
  const list = await getDocumentList();
  console.log('Current document list before adding:', list);
  
  if (!list.includes(id)) {
    list.push(id);
    await localforage.setItem('documentList', list);
    console.log('Updated document list after adding:', list);
  }
}

// Helper function to remove a document from the list
async function removeFromDocumentList(id: string): Promise<void> {
  const list = await getDocumentList();
  const newList = list.filter(docId => docId !== id);
  await localforage.setItem('documentList', newList);
} 