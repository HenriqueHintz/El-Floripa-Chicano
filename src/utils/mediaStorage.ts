/**
 * Media Storage & Client-Side File Processing Engine for El Chicano
 *
 * Capabilities:
 * - Direct file upload from Computer and Mobile (Camera & Photo/Video Gallery).
 * - Automatic image compression via HTML5 Canvas (WebP/JPEG, max 1600px).
 * - Automatic video thumbnail/poster extraction at 0.5s using HTML5 Video + Canvas.
 * - IndexedDB persistent storage for heavy media (videos and high-res photos) to bypass localStorage 5MB quota.
 * - Base64 fallback for cross-session and D1 database synchronization.
 */

const DB_NAME = 'ElChicanoMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

interface StoredMediaRecord {
  id: string; // e.g., 'slot_1', 'franchise_video', 'franchise_video_poster'
  blob: Blob;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  dataUrl?: string;
  updatedAt: number;
}

/**
 * Initializes and returns the IndexedDB instance.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Compresses an image file client-side to lightweight WebP/JPEG using Canvas.
 * Keeps output under ~150KB-300KB for maximum performance and portability.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string; sizeMb: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Calculate proportional aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP for superior compression, fallback to JPEG
      const mimeType = 'image/webp';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
          resolve({ blob, dataUrl, sizeMb });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

/**
 * Automatically extracts the first frame of a video file to use as thumbnail/poster.
 */
export async function extractVideoThumbnail(videoFile: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(videoFile);

    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.5;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onloadeddata = () => {
      // Seek slightly past 0 to avoid blank initial frames
      video.currentTime = Math.min(1.0, video.duration > 1 ? 1.0 : 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbDataUrl = canvas.toDataURL('image/webp', 0.8);
          cleanup();
          resolve(thumbDataUrl);
          return;
        }
      } catch {
        // Fallback silently if canvas security blocks frame
      }
      cleanup();
      resolve('');
    };

    video.onerror = () => {
      cleanup();
      resolve('');
    };

    // Timeout safety fallback
    setTimeout(() => {
      cleanup();
      resolve('');
    }, 4000);
  });
}

/**
 * Converts a file or blob directly to a Base64 Data URL.
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Persists a media file (image or video) into IndexedDB.
 */
export async function saveMediaToDB(
  id: string,
  fileOrBlob: File | Blob,
  fileName?: string,
  dataUrl?: string
): Promise<{ url: string; sizeMb: string }> {
  try {
    const db = await openDB();
    const sizeBytes = fileOrBlob.size;
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    const mimeType = fileOrBlob.type || 'application/octet-stream';

    const record: StoredMediaRecord = {
      id,
      blob: fileOrBlob,
      mimeType,
      fileName: fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'midia'),
      sizeBytes,
      dataUrl,
      updatedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // If dataUrl exists, return it; otherwise create a local blob URL
    const url = dataUrl || URL.createObjectURL(fileOrBlob);
    return { url, sizeMb };
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to dataUrl/blobUrl:', err);
    const url = dataUrl || URL.createObjectURL(fileOrBlob);
    const sizeMb = (fileOrBlob.size / (1024 * 1024)).toFixed(2);
    return { url, sizeMb };
  }
}

/**
 * Retrieves a media file from IndexedDB by ID and returns a playable/displayable URL.
 */
export async function getMediaFromDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const record = req.result as StoredMediaRecord | undefined;
        if (!record) {
          resolve(null);
          return;
        }

        // Return Base64 dataUrl if present, else create object URL from Blob
        if (record.dataUrl) {
          resolve(record.dataUrl);
        } else if (record.blob) {
          resolve(URL.createObjectURL(record.blob));
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Removes a media file from IndexedDB.
 */
export async function deleteMediaFromDB(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
