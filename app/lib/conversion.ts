import { saveDocument, getAllDocuments, getDocument } from './storage';
import localforage from 'localforage';
import type { DocumentMeta } from './storage';

/**
 * Supported conversion formats
 */
export const CONVERSION_FORMATS = {
  'application/pdf': ['image/png', 'image/jpeg'],
  'image/png': ['application/pdf', 'image/jpeg'],
  'image/jpeg': ['application/pdf', 'image/png'],
  'image/webp': ['application/pdf', 'image/png', 'image/jpeg'],
};

/**
 * Format map for display purposes
 */
export const FORMAT_MAP: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP'
};

/**
 * Interface for conversion options
 */
export interface ConversionOptions {
  quality?: number;
  preserveAspectRatio?: boolean;
}

/**
 * Custom error class for conversion errors
 */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

/**
 * Validate that a conversion is supported
 * @param sourceType The source document type
 * @param targetType The target format to convert to
 * @throws ConversionError if the conversion is not supported
 */
export function validateConversion(sourceType: string, targetType: string): void {
  // Check if source type is supported
  if (!Object.keys(CONVERSION_FORMATS).includes(sourceType)) {
    throw new ConversionError(`Unsupported source format: ${sourceType}`);
  }
  
  // Check if target type is supported for this source type
  const supportedTargets = CONVERSION_FORMATS[sourceType as keyof typeof CONVERSION_FORMATS] || [];
  if (!supportedTargets.includes(targetType)) {
    throw new ConversionError(`Conversion from ${sourceType} to ${targetType} is not supported`);
  }
}

/**
 * Create an Image object from an ArrayBuffer
 * @param buffer The image data as ArrayBuffer
 * @param mimeType The MIME type of the image
 * @returns Promise with the created Image object
 * @throws ConversionError if the image creation fails
 */
function createImageFromArrayBuffer(buffer: ArrayBuffer, mimeType: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new ConversionError(`Failed to load image of type ${mimeType}`));
      };
      
      img.src = url;
    } catch (error) {
      reject(new ConversionError(`Failed to create image from buffer: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Convert a document to PDF
 * @param sourceData The source document data
 * @param sourceMeta The source document metadata
 * @returns Promise with the converted PDF blob
 * @throws ConversionError if the conversion fails
 */
async function convertToPdf(sourceData: ArrayBuffer, sourceMeta: DocumentMeta): Promise<Blob> {
  try {
    // If source is already PDF, just return it
    if (sourceMeta.type === 'application/pdf') {
      return new Blob([sourceData], { type: 'application/pdf' });
    }
    
    // For images, create a PDF with the image embedded
    if (sourceMeta.type.startsWith('image/')) {
      // Use the simplest and most reliable method - create a data URL and embed it in an HTML page
      // Then convert that to a PDF-like structure
      return await createPdfFromImage(sourceData, sourceMeta);
    }
    
    // Fallback for unsupported source types
    throw new ConversionError(`Conversion from ${sourceMeta.type} to PDF is not supported`);
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    } else {
      console.error('PDF conversion error:', error);
      throw new ConversionError(`Failed to convert to PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Create a PDF from an image using a reliable method
 */
async function createPdfFromImage(sourceData: ArrayBuffer, sourceMeta: DocumentMeta): Promise<Blob> {
  try {
    // Create an image element from the source data
    const img = await createImageFromArrayBuffer(sourceData, sourceMeta.type);
    
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new ConversionError('Failed to get canvas context');
    }
    
    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get the image data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create a simple HTML document with the image
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sourceMeta.name}</title>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
          img { max-width: 100%; max-height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="${sourceMeta.name}" />
      </body>
      </html>
    `;
    
    // Create a blob from the HTML
    const htmlBlob = new Blob([html], { type: 'text/html' });
    
    // For browsers that support the Print to PDF feature, we would normally:
    // 1. Create an iframe with this HTML
    // 2. Call the print method on the iframe's window
    // 3. The user would select "Save as PDF" in the print dialog
    
    // Since we can't automate that process in the browser, we'll create a simple PDF directly
    
    // Use a simpler approach - create a PDF with a JPEG image
    // First, get the raw JPEG data from the data URL
    const jpegData = dataUrl.split(',')[1];
    const binaryString = atob(jpegData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a simple PDF with the JPEG image embedded
    // This is a minimal PDF structure that should work in most PDF viewers
    const pdfHeader = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${img.width} ${img.height}] /Resources << /XObject << /Image 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>
stream
`;

    const pdfFooter = `
endstream
endobj
5 0 obj
<< /Length 44 >>
stream
q
${img.width} 0 0 ${img.height} 0 0 cm
/Image Do
Q
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000116 00000 n
0000000266 00000 n
0000000${266 + bytes.length + 100} 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0000000${266 + bytes.length + 200}
%%EOF`;

    // Combine the header, JPEG data, and footer into a single PDF
    const pdfBlob = new Blob([
      pdfHeader,
      bytes,
      pdfFooter
    ], { type: 'application/pdf' });
    
    return pdfBlob;
  } catch (error) {
    console.error('Error creating PDF from image:', error);
    throw new ConversionError(`Failed to create PDF from image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert a document to an image format
 * @param sourceData The source document data
 * @param sourceMeta The source document metadata
 * @param targetFormat The target image format
 * @param options Conversion options
 * @returns Promise with the converted image blob
 * @throws ConversionError if the conversion fails
 */
async function convertToImage(
  sourceData: ArrayBuffer, 
  sourceMeta: DocumentMeta, 
  targetFormat: string,
  options: ConversionOptions
): Promise<Blob> {
  try {
    // If source is already the target format, just return it
    if (sourceMeta.type === targetFormat) {
      return new Blob([sourceData], { type: targetFormat });
    }
    
    // For image to image conversion
    if (sourceMeta.type.startsWith('image/')) {
      // Create a canvas to draw the image
      const img = await createImageFromArrayBuffer(sourceData, sourceMeta.type);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new ConversionError('Failed to get canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to target format
      const quality = options.quality || 0.92;
      return await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new ConversionError('Failed to convert image'));
            }
          },
          targetFormat,
          quality
        );
      });
    }
    
    // For PDF to image conversion (first page only)
    if (sourceMeta.type === 'application/pdf') {
      // In a real implementation, you would use a PDF rendering library
      // For this demo, we'll create a placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new ConversionError('Failed to get canvas context');
      }
      
      // Draw a placeholder with text
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`PDF: ${sourceMeta.name}`, canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText('(PDF to image conversion)', canvas.width / 2, canvas.height / 2 + 30);
      
      // Convert to target format
      const quality = options.quality || 0.92;
      return await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new ConversionError('Failed to convert PDF to image'));
            }
          },
          targetFormat,
          quality
        );
      });
    }
    
    // Fallback for unsupported source types
    throw new ConversionError(`Conversion from ${sourceMeta.type} to ${targetFormat} is not supported`);
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    } else {
      console.error('Image conversion error:', error);
      throw new ConversionError(`Failed to convert to image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Convert a document to another format
 * @param sourceData The source document data
 * @param sourceMeta The source document metadata
 * @param targetFormat The target format to convert to
 * @param options Conversion options
 * @returns Promise with the converted document metadata
 * @throws ConversionError if the conversion fails
 */
export async function convertDocument(
  sourceData: ArrayBuffer,
  sourceMeta: DocumentMeta,
  targetFormat: string,
  options: ConversionOptions = {}
): Promise<DocumentMeta> {
  try {
    // Validate the conversion
    validateConversion(sourceMeta.type, targetFormat);
    
    // Create a new file name based on the conversion format
    const extension = targetFormat.split('/')[1];
    const baseName = sourceMeta.name.split('.').slice(0, -1).join('.');
    const newFileName = `${baseName}.${extension}`;
    
    let convertedBlob: Blob;
    
    // Handle different conversion scenarios
    if (targetFormat === 'application/pdf') {
      // Convert to PDF
      convertedBlob = await convertToPdf(sourceData, sourceMeta);
    } else if (targetFormat.startsWith('image/')) {
      // Convert to image format
      convertedBlob = await convertToImage(sourceData, sourceMeta, targetFormat, options);
    } else {
      throw new ConversionError(`Unsupported target format: ${targetFormat}`);
    }
    
    // Create a File object from the Blob
    const convertedFile = new File([convertedBlob], newFileName, { type: targetFormat });
    
    // Save the converted document
    const savedDoc = await saveDocument(convertedFile);
    
    // Add metadata for converted PDFs to mark them as generated documents
    if (targetFormat === 'application/pdf') {
      // Add metadata indicating this is a generated document
      savedDoc.metadata = {
        isGeneratedDocument: true,
        sourceDocumentId: sourceMeta.id,
        sourceDocumentName: sourceMeta.name,
        sourceDocumentType: sourceMeta.type,
        conversionTimestamp: Date.now()
      };
      
      // Update the metadata in storage
      await localforage.setItem(`meta:${savedDoc.id}`, savedDoc);
    }
    
    return savedDoc;
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    } else {
      console.error('Conversion error:', error);
      throw new ConversionError(`Failed to convert document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Batch convert documents to PDF
 * @param documents Array of document metadata and data to convert
 * @returns Promise with array of converted document metadata
 */
export async function batchConvertToPDF(
  documents: Array<{ meta: DocumentMeta, data: ArrayBuffer }>
): Promise<DocumentMeta[]> {
  const convertedDocs: DocumentMeta[] = [];
  const errors: { name: string, error: string }[] = [];
  
  for (const doc of documents) {
    // Skip if already PDF
    if (doc.meta.type === 'application/pdf') {
      continue;
    }
    
    try {
      const convertedMeta = await convertDocument(doc.data, doc.meta, 'application/pdf');
      convertedDocs.push(convertedMeta);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error converting document ${doc.meta.name}:`, error);
      errors.push({ name: doc.meta.name, error: errorMessage });
      // Continue with other documents even if one fails
    }
  }
  
  // If there were errors, log them but continue with the successful conversions
  if (errors.length > 0) {
    console.warn(`Failed to convert ${errors.length} document(s):`, errors);
  }
  
  return convertedDocs;
}

/**
 * Merge multiple images into a single PDF document
 * @param documents Array of document metadata and data to merge
 * @param additionalMetadata Optional metadata to add to the document
 * @returns Promise with the merged PDF document metadata
 * @throws ConversionError if the merge fails
 */
export async function mergeImagesToPDF(
  documents: Array<{ meta: DocumentMeta, data: ArrayBuffer }>,
  additionalMetadata?: Record<string, unknown>
): Promise<DocumentMeta> {
  try {
    // Filter out non-image documents
    const imageDocuments = documents.filter(doc => doc.meta.type.startsWith('image/'));
    
    if (imageDocuments.length === 0) {
      throw new ConversionError('No image documents provided for merging');
    }
    
    // Load all images
    const images: HTMLImageElement[] = [];
    for (const doc of imageDocuments) {
      try {
        const img = await createImageFromArrayBuffer(doc.data, doc.meta.type);
        images.push(img);
      } catch (error) {
        console.error(`Failed to load image ${doc.meta.name}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    if (images.length === 0) {
      throw new ConversionError('Failed to load any images for merging');
    }
    
    // Create PDF content
    let pdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [`;
    
    // Add page references
    for (let i = 0; i < images.length; i++) {
      pdfContent += `${3 + i * 3} 0 R `;
    }
    
    pdfContent += `] /Count ${images.length} >>
endobj
`;
    
    // Track the current object number
    let objectNumber = 3;
    // Track xref positions
    const xrefPositions: number[] = [0, pdfContent.indexOf('1 0 obj'), pdfContent.indexOf('2 0 obj')];
    
    // Add each image as a separate page
    const imageDataArrays: Uint8Array[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new ConversionError('Failed to get canvas context');
      }
      
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get the image data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Get the raw JPEG data
      const jpegData = dataUrl.split(',')[1];
      const binaryString = atob(jpegData);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      
      // Store the image data for later
      imageDataArrays.push(bytes);
      
      // Add page object
      xrefPositions.push(pdfContent.length);
      pdfContent += `${objectNumber} 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${img.width} ${img.height}] /Resources << /XObject << /Image${i} ${objectNumber + 1} 0 R >> >> /Contents ${objectNumber + 2} 0 R >>
endobj
`;
      objectNumber++;
      
      // Add image object reference (actual data will be added later)
      xrefPositions.push(pdfContent.length);
      pdfContent += `${objectNumber} 0 obj
<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>
stream
`;
      objectNumber++;
      
      // Add content stream object
      xrefPositions.push(pdfContent.length + bytes.length + 10); // +10 for "endstream" and newlines
      pdfContent += `endstream
endobj
${objectNumber} 0 obj
<< /Length 44 >>
stream
q
${img.width} 0 0 ${img.height} 0 0 cm
/Image${i} Do
Q
endstream
endobj
`;
      objectNumber++;
    }
    
    // Add xref table
    const xrefStart = pdfContent.length;
    pdfContent += `xref
0 ${objectNumber}
0000000000 65535 f
`;
    
    // Add xref entries
    for (let i = 1; i < objectNumber; i++) {
      const position = xrefPositions[i];
      // Format position as 10-digit number with leading zeros
      const formattedPosition = position.toString().padStart(10, '0');
      pdfContent += `${formattedPosition} 00000 n
`;
    }
    
    // Add trailer
    pdfContent += `trailer
<< /Size ${objectNumber} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;
    
    // Create a merged PDF by combining the PDF content with the image data
    const parts: (string | Uint8Array)[] = [pdfContent];
    
    // Insert image data at the appropriate positions
    let finalPdfContent = '';
    let lastIndex = 0;
    
    // Find all positions where image data should be inserted
    const imageDataPositions: Array<{ start: number; end: number }> = [];
    let searchPos = 0;
    while (true) {
      const streamPos = pdfContent.indexOf('stream\n', searchPos);
      if (streamPos === -1) break;
      const endstreamPos = pdfContent.indexOf('endstream', streamPos);
      if (endstreamPos === -1) break;
      
      // Check if this is an image stream (has /DCTDecode)
      const objectStart = pdfContent.lastIndexOf('obj', streamPos);
      if (objectStart !== -1 && pdfContent.substring(objectStart, streamPos).includes('/DCTDecode')) {
        imageDataPositions.push({ start: streamPos + 7, end: endstreamPos }); // +7 for "stream\n"
      }
      
      searchPos = endstreamPos + 9; // +9 for "endstream"
    }
    
    // Create the final PDF content with image data inserted
    let imageIndex = 0;
    let finalParts: (string | Uint8Array)[] = [];
    
    for (let i = 0; i < imageDataPositions.length; i++) {
      const { start, end } = imageDataPositions[i];
      finalParts.push(pdfContent.substring(lastIndex, start));
      finalParts.push(imageDataArrays[imageIndex]);
      lastIndex = end;
      imageIndex++;
    }
    
    finalParts.push(pdfContent.substring(lastIndex));
    
    // Create a blob with the PDF content
    const pdfBlob = new Blob(finalParts, { type: 'application/pdf' });
    
    // Create a file name for the merged PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `merged-images-${timestamp}.pdf`;
    
    // Create a File object from the Blob
    const mergedFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Save the merged document
    const savedDoc = await saveDocument(mergedFile);
    
    // Add additional metadata if provided
    if (additionalMetadata && Object.keys(additionalMetadata).length > 0) {
      savedDoc.metadata = additionalMetadata;
      
      // Update the metadata in storage
      await localforage.setItem(`meta:${savedDoc.id}`, savedDoc);
    }
    
    return savedDoc;
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    } else {
      console.error('PDF merge error:', error);
      throw new ConversionError(`Failed to merge images to PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 