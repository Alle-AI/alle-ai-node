import { promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { createWriteStream } from "fs";
import https from 'https';
import http from 'http';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

// Supported file extensions by type
const SUPPORTED_EXTENSIONS = {
  image: new Set<string>([".jpg", ".jpeg", ".png", ".gif", ".bmp"]),
  audio: new Set<string>([".mp3", ".wav", ".ogg", ".m4a", ".aac"]),
  video: new Set<string>([".mp4", ".mov", ".avi", ".webm"]),
  pdf: new Set<string>([".pdf"])
} as const;

// MIME types mapping
const MIME_TYPES = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".webm": "video/webm",
  ".pdf": "application/pdf"
} as const;

type FileType = keyof typeof SUPPORTED_EXTENSIONS;

/**
 * Downloads a file from URL and saves it locally
 * @param url URL to download from
 * @param destPath Path to save the file to
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const fileStream = createWriteStream(destPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fileStream.close();
        fs.unlink(destPath).catch(() => {}); // Clean up file
        reject(new Error(`Failed to download file: ${response.statusMessage}`));
        return;
      }

      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      fileStream.close();
      fs.unlink(destPath).catch(() => {}); // Clean up file
      reject(err);
    });
  });
}

/**
 * Processes a file path or URL and returns the file buffer and metadata
 * @param filePath Path to local file or URL
 * @param type Type of file to process
 * @returns Promise with buffer and metadata
 */
export const processFile = async (filePath: string, type: FileType): Promise<{
  buffer: Buffer,
  filename: string,
  filepath: string
}> => {
  try {
    // Check if it's a URL
    const url = new URL(filePath);
    const fileExt = path.extname(url.pathname).toLowerCase();
    
    // Validate file extension
    if (!SUPPORTED_EXTENSIONS[type].has(fileExt)) {
      throw new Error(
        `URL file type '${fileExt}' not supported for ${type}. Supported types: ${Array.from(SUPPORTED_EXTENSIONS[type]).join(", ")}`
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Generate temp file path
    const filename = path.basename(url.pathname);
    const tempPath = path.join(tempDir, `${Date.now()}-${filename}`);

    // Download file
    await downloadFile(url.toString(), tempPath);

    // Get file stats
    const stats = await fs.stat(tempPath);
    if (stats.size > MAX_FILE_SIZE) {
      await fs.unlink(tempPath); // Clean up
      throw new Error(`File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds max limit (20MB)`);
    }

    // Read the file
    const buffer = await fs.readFile(tempPath);

    // Clean up temp file
    await fs.unlink(tempPath);

    return { buffer, filename, filepath: tempPath };

  } catch (e) {
    // Not a URL, process as local file
    if (!(e instanceof TypeError)) {
      throw e; // Rethrow if it's not a URL parsing error
    }

    // Handle local file
    try {
      const absolutePath = path.resolve(process.cwd(), filePath.trim());
      const stats = await fs.stat(absolutePath);

      if (!stats.isFile()) {
        throw new Error(`Not a file: ${filePath}`);
      }

      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds max limit (20MB)`
        );
      }

      const fileExt = path.extname(absolutePath).toLowerCase();
      if (!SUPPORTED_EXTENSIONS[type].has(fileExt)) {
        throw new Error(
          `File type '${fileExt}' not supported for ${type}. Supported types: ${Array.from(SUPPORTED_EXTENSIONS[type]).join(", ")}`
        );
      }

      const buffer = await fs.readFile(absolutePath);
      const filename = path.basename(absolutePath);

      return { buffer, filename, filepath: absolutePath };

    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }
};

// Keep the old attachFile function for backward compatibility
/**
 * @deprecated Use processFile instead
 */
export const attachFile = async (filePath: string): Promise<string> => {
  const { buffer } = await processFile(filePath, "image");
  return buffer.toString("base64");
};
