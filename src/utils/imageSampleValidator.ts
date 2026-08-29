/**
 * Lightweight client-side image suitability validator for Feed & Silage quality screening.
 * 
 * Purpose:
 * Prevents users from accidentally screening distant crop fields, landscape photos,
 * sky-heavy images, or non-feed scenes that could be misinterpreted by visual screening rules.
 * 
 * Note: This is NOT mould or spoilage detection. It ONLY checks whether the photo is a
 * close-up sample suitable for visual quality evaluation.
 */

export interface ImageValidationResult {
  isValid: boolean;
  title?: string;
  message?: string;
}

/**
 * Validates whether an image is a suitable close-up feed sample.
 */
export async function validateFeedSampleImage(
  imageSource: File | string
): Promise<ImageValidationResult> {
  return validateSampleImage(imageSource, 'feed');
}

/**
 * Validates whether an image is a suitable close-up silage sample or bunker face.
 */
export async function validateSilageSampleImage(
  imageSource: File | string
): Promise<ImageValidationResult> {
  return validateSampleImage(imageSource, 'silage');
}

async function validateSampleImage(
  imageSource: File | string,
  sampleType: 'feed' | 'silage'
): Promise<ImageValidationResult> {
  try {
    const dataUrl =
      typeof imageSource === 'string'
        ? imageSource
        : await fileToDataUrl(imageSource);

    const img = await loadImage(dataUrl);

    // Analyze using a low-res 64x64 canvas for fast, lightweight processing
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      // If canvas is unavailable in environment, pass through safely
      return { isValid: true };
    }

    ctx.drawImage(img, 0, 0, 64, 64);
    const imageData = ctx.getImageData(0, 0, 64, 64);
    const data = imageData.data;

    let topSkyPixels = 0;
    let topTotalPixels = 0;
    let bottomGreenGroundPixels = 0;
    let bottomTotalPixels = 0;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    const topBoundaryRow = 22; // Top ~35% of image (rows 0 to 22)
    const bottomStartRow = 32; // Bottom ~50% of image (rows 32 to 63)

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = (y * 64 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        totalR += r;
        totalG += g;
        totalB += b;

        // Sky detection (Blue sky or bright daylight overcast)
        const isBlueSky = b > r + 15 && b > 110 && g > 90;
        const isOvercastSky = r > 215 && g > 215 && b > 220 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
        const isSkyLike = isBlueSky || isOvercastSky;

        if (y <= topBoundaryRow) {
          topTotalPixels++;
          if (isSkyLike) {
            topSkyPixels++;
          }
        }

        if (y >= bottomStartRow) {
          bottomTotalPixels++;
          // Distant green foliage or dark outdoor horizon
          const isGreenField = g > r + 12 && g > b + 8;
          const isDarkGround = (r + g + b) / 3 < 70;
          if (isGreenField || isDarkGround) {
            bottomGreenGroundPixels++;
          }
        }
      }
    }

    const topSkyRatio = topSkyPixels / (topTotalPixels || 1);
    const bottomLandscapeRatio = bottomGreenGroundPixels / (bottomTotalPixels || 1);

    // Calculate image color variance to reject completely blank or uniform non-samples
    const avgR = totalR / 4096;
    const avgG = totalG / 4096;
    const avgB = totalB / 4096;
    let varianceSum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const diffR = data[i] - avgR;
      const diffG = data[i + 1] - avgG;
      const diffB = data[i + 2] - avgB;
      varianceSum += (diffR * diffR + diffG * diffG + diffB * diffB) / 3;
    }
    const colorStdDev = Math.sqrt(varianceSum / 4096);

    // Check 1: Solid blank / flat uniform screen
    if (colorStdDev < 6.0) {
      return {
        isValid: false,
        title: 'Invalid Sample Image',
        message:
          sampleType === 'feed'
            ? 'Please upload a clear close-up photo of the feed sample. The image appears completely blank or unreadable.'
            : 'Please upload a clear close-up photo of the silage sample or bunker face. The image appears blank.',
      };
    }

    // Check 2: Obvious Sky/Landscape or Distant Field Photo
    // Top has heavy sky (> 40%) AND bottom has distant field/ground (> 35%) OR heavy sky (> 50%)
    const isLandscapeWithSky = topSkyRatio > 0.40 && bottomLandscapeRatio > 0.35;
    const isMostlySky = topSkyRatio > 0.50;

    if (isLandscapeWithSky || isMostlySky) {
      return {
        isValid: false,
        title: 'Invalid Sample Image',
        message:
          sampleType === 'feed'
            ? 'Please upload a clear close-up photo of the feed sample. Avoid distant field or landscape photos.'
            : 'Please upload a clear close-up photo of the silage sample or bunker face.',
      };
    }

    return { isValid: true };
  } catch {
    // If an error occurs during decoding, allow through to avoid blocking valid photos
    return { isValid: true };
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
