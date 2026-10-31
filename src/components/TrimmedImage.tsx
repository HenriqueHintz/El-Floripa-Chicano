import React, { useState, useEffect } from 'react';

// In-memory cache for trimmed images across component re-renders
const imageTrimCache = new Map<string, string>();

interface TrimmedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Trims letterboxed white borders from product images (e.g., photos uploaded with
 * blank top/bottom white bars) and centers the food cleanly.
 */
export const TrimmedImage: React.FC<TrimmedImageProps> = ({
  src,
  alt,
  className,
  onLoad,
  onError,
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>(
    () => imageTrimCache.get(src) || src
  );

  useEffect(() => {
    if (imageTrimCache.has(src)) {
      setDisplaySrc(imageTrimCache.get(src)!);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const isWhite = (x: number, y: number) => {
          const idx = (y * w + x) * 4;
          return data[idx + 3] > 0 && data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240;
        };

        let top = 0;
        let bottom = h - 1;
        let left = 0;
        let right = w - 1;

        // Sample top down
        for (let y = 0; y < h; y += 2) {
          let allWhite = true;
          for (let x = 0; x < w; x += 4) {
            if (!isWhite(x, y)) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) {
            top = Math.max(0, y - 2);
            break;
          }
        }

        // Sample bottom up
        for (let y = h - 1; y >= 0; y -= 2) {
          let allWhite = true;
          for (let x = 0; x < w; x += 4) {
            if (!isWhite(x, y)) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) {
            bottom = Math.min(h - 1, y + 2);
            break;
          }
        }

        // Sample left right
        for (let x = 0; x < w; x += 2) {
          let allWhite = true;
          for (let y = top; y <= bottom; y += 4) {
            if (!isWhite(x, y)) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) {
            left = Math.max(0, x - 2);
            break;
          }
        }

        // Sample right left
        for (let x = w - 1; x >= 0; x -= 2) {
          let allWhite = true;
          for (let y = top; y <= bottom; y += 4) {
            if (!isWhite(x, y)) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) {
            right = Math.min(w - 1, x + 2);
            break;
          }
        }

        const cropW = right - left + 1;
        const cropH = bottom - top + 1;

        // Only crop if at least 12px was trimmed
        if (cropW < w - 12 || cropH < h - 12) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(img, left, top, cropW, cropH, 0, 0, cropW, cropH);
            const trimmedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.92);
            imageTrimCache.set(src, trimmedDataUrl);
            if (isMounted) setDisplaySrc(trimmedDataUrl);
          }
        } else {
          imageTrimCache.set(src, src);
        }
      } catch {
        imageTrimCache.set(src, src);
      }
    };

    img.onerror = () => {
      imageTrimCache.set(src, src);
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

