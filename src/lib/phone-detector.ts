import type { PixelBox } from '@/lib/types';

export interface PhoneReading {
  /** True when skin-dense hand/arm region is detected near the face */
  detected: boolean;
  /** 0–1 fraction of skin-coloured pixels in the zone */
  skinDensity: number;
  /** The sampled ROI in video-pixel coordinates (for visualisation) */
  zone: PixelBox | null;
}

// Fraction of pixels in the zone that must match skin colour to declare a hand present
const SKIN_THRESHOLD = 0.18;
// Side of the internal sampling canvas (48×48 = 2304 samples — fast, good resolution)
const SAMPLE_SIZE = 48;

/**
 * Returns true if the RGB triplet falls within the standard YCbCr skin-colour
 * band (Kovac et al. 2003 / Chai & Ngan 1999).  Works across a wide range of
 * skin tones under typical indoor lighting.
 */
function isSkin(r: number, g: number, b: number): boolean {
  const y  =  0.299   * r + 0.587    * g + 0.114    * b;
  const cb = -0.168736 * r - 0.331264 * g + 0.5      * b + 128;
  const cr =  0.5     * r - 0.418688 * g - 0.081312 * b + 128;
  return y >= 80 && y <= 240 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

/**
 * Lightweight, model-free phone-posture detector.
 *
 * Strategy: sample the region directly below the face bounding box (chin →
 * shoulder area).  When a hand/arm enters that zone the skin-pixel density
 * spikes noticeably.  No extra ML model required — runs purely in pixel space.
 */
export class PhoneDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width  = SAMPLE_SIZE;
    this.canvas.height = SAMPLE_SIZE;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('PhoneDetector: unable to create 2D canvas context');
    this.ctx = ctx;
  }

  /**
   * Analyse the current video frame for a hand near the face.
   * Must be called on every frame while detection is active.
   *
   * @param video   The live <video> element (must be playing)
   * @param faceBox Face bounding box in video-pixel coordinates
   */
  estimate(video: HTMLVideoElement, faceBox: PixelBox): PhoneReading {
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    if (!vW || !vH) return { detected: false, skinDensity: 0, zone: null };

    // ── Define zone: chin-level downward, slightly wider than the face ───────
    const zoneX = Math.max(0, faceBox.x - faceBox.width * 0.15);
    const zoneY = Math.max(0, faceBox.y + faceBox.height * 0.65);
    const zoneW = Math.min(faceBox.width * 1.30, vW - zoneX);
    const zoneH = Math.min(faceBox.height * 0.90, vH - zoneY);

    if (zoneW <= 4 || zoneH <= 4) return { detected: false, skinDensity: 0, zone: null };

    const zone: PixelBox = { x: zoneX, y: zoneY, width: zoneW, height: zoneH };

    // ── Sample the zone into a tiny canvas for fast pixel access ─────────────
    this.ctx.drawImage(video, zoneX, zoneY, zoneW, zoneH, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = this.ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    let skinPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (isSkin(data[i], data[i + 1], data[i + 2])) skinPixels++;
    }

    const skinDensity = skinPixels / (SAMPLE_SIZE * SAMPLE_SIZE);
    return { detected: skinDensity >= SKIN_THRESHOLD, skinDensity, zone };
  }
}
