// ClipDrop Image Upscaling Service
const CLIPDROP_API_KEY = import.meta.env.VITE_CLIPDROP_API_KEY;
const CLIPDROP_API_URL = 'https://clipdrop-api.co/image-upscaling/v1/upscale';

// Quota tracking
const MONTHLY_FREE_QUOTA = 100;
const QUOTA_STORAGE_KEY = 'upscale-quota-tracker';

interface QuotaTracker {
  month: string; // Format: YYYY-MM
  used: number;
}

export interface UpscaleOptions {
  scale: 2 | 4;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Get current month key (YYYY-MM)
 */
const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Get quota tracker from localStorage
 */
const getQuotaTracker = (): QuotaTracker => {
  try {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (stored) {
      const tracker: QuotaTracker = JSON.parse(stored);
      const currentMonth = getCurrentMonthKey();

      // Reset if new month
      if (tracker.month !== currentMonth) {
        return { month: currentMonth, used: 0 };
      }

      return tracker;
    }
  } catch (error) {
    console.error('Failed to load quota tracker:', error);
  }

  return { month: getCurrentMonthKey(), used: 0 };
};

/**
 * Save quota tracker to localStorage
 */
const saveQuotaTracker = (tracker: QuotaTracker): void => {
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(tracker));
  } catch (error) {
    console.error('Failed to save quota tracker:', error);
  }
};

/**
 * Increment quota usage
 */
const incrementQuota = (): void => {
  const tracker = getQuotaTracker();
  tracker.used += 1;
  saveQuotaTracker(tracker);
};

/**
 * Get remaining quota
 */
export const getRemainingQuota = (): { used: number; total: number; remaining: number } => {
  const tracker = getQuotaTracker();
  return {
    used: tracker.used,
    total: MONTHLY_FREE_QUOTA,
    remaining: Math.max(0, MONTHLY_FREE_QUOTA - tracker.used)
  };
};

/**
 * Convert data URL to Blob
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Upscale image using ClipDrop API
 * @param imageDataUrl - Base64 data URL of the image
 * @param options - Upscaling options (scale factor)
 * @returns Promise with upscaled image data URL
 */
export const upscaleImage = async (
  imageDataUrl: string,
  options: UpscaleOptions = { scale: 2 }
): Promise<string> => {

  if (!CLIPDROP_API_KEY) {
    throw new Error('ClipDrop API key not configured');
  }

  try {
    // Convert data URL to Blob
    const imageBlob = dataURLtoBlob(imageDataUrl);

    // Get original image dimensions
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageDataUrl;
    });

    // Calculate target dimensions
    const targetWidth = options.targetWidth || img.width * options.scale;
    const targetHeight = options.targetHeight || img.height * options.scale;

    // Create FormData
    const formData = new FormData();
    formData.append('image_file', imageBlob, 'image.png');
    formData.append('target_width', targetWidth.toString());
    formData.append('target_height', targetHeight.toString());

    // Call ClipDrop API
    const response = await fetch(CLIPDROP_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CLIPDROP_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ClipDrop API Error:', errorText);

      if (response.status === 402) {
        throw new Error('ClipDrop API quota exceeded. Please upgrade or try again later.');
      } else if (response.status === 401) {
        throw new Error('Invalid ClipDrop API key.');
      } else {
        throw new Error(`Upscaling failed: ${response.statusText}`);
      }
    }

    // Convert response to Blob
    const resultBlob = await response.blob();

    // Increment quota usage after successful API call
    incrementQuota();

    // Convert Blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(resultBlob);
    });

  } catch (error: any) {
    console.error('Upscaling error:', error);
    throw new Error(error.message || 'Failed to upscale image');
  }
};

/**
 * Check if upscaling is enabled
 */
export const isUpscalingEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_UPSCALING === 'true' && !!CLIPDROP_API_KEY;
};

/**
 * Get estimated upscale dimensions
 */
export const getUpscaleDimensions = (
  originalWidth: number,
  originalHeight: number,
  scale: 2 | 4
): { width: number; height: number; megapixels: number } => {
  const width = originalWidth * scale;
  const height = originalHeight * scale;
  const megapixels = (width * height) / 1000000;

  return {
    width,
    height,
    megapixels: Math.round(megapixels * 100) / 100
  };
};
