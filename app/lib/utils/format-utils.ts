/**
 * Format a timestamp to a localized date string
 * @param timestamp The timestamp to format
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes The file size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

/**
 * Generate a timestamp-based filename
 * @param prefix Prefix for the filename
 * @param extension File extension (without the dot)
 * @returns Filename with timestamp
 */
export function generateTimestampFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Extract file extension from a filename
 * @param filename The filename
 * @returns The file extension (without the dot)
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file name without extension
 * @param filename The filename
 * @returns The filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
} 