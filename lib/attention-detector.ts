import { AttentionReading, BaselinePose, CalibrationReport } from '@/lib/types';

interface PixelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

interface FaceMeshResult {
  multiFaceLandmarks?: Landmark[][];
}

type FaceMeshInstance = {
  setOptions: (opts: Record<string, unknown>) => void;
  onResults: (cb: (results: FaceMeshResult) => void) => void;
  send: (input: { image: HTMLCanvasElement }) => Promise<void>;
};

declare global {
  interface Window {
    FaceMesh?: new (opts: { locateFile: (file: string) => string }) => FaceMeshInstance;
  }
}

const INPUT_SIZE = 320;
const ZOOM_SCALE = 1.35;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export class AttentionDetector {
  private mesh: FaceMeshInstance | null = null;
  private analysisCanvas: HTMLCanvasElement;
  private analysisCtx: CanvasRenderingContext2D;
  private lightingCanvas: HTMLCanvasElement;
  private lightingCtx: CanvasRenderingContext2D;
  private roi: PixelBox | null = null;
  private previousLandmarks: Landmark[] | null = null;

  constructor() {
    this.analysisCanvas = document.createElement('canvas');
    this.analysisCanvas.width = INPUT_SIZE;
    this.analysisCanvas.height = INPUT_SIZE;
    const ctx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Unable to create analysis canvas.');
    this.analysisCtx = ctx;

    this.lightingCanvas = document.createElement('canvas');
    this.lightingCanvas.width = 160;
    this.lightingCanvas.height = 90;
    const lightCtx = this.lightingCanvas.getContext('2d', { willReadFrequently: true });
    if (!lightCtx) throw new Error('Unable to create lighting canvas.');
    this.lightingCtx = lightCtx;
  }

  async init() {
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
    if (!window.FaceMesh) {
      throw new Error('MediaPipe Face Mesh API unavailable.');
    }
    this.mesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    this.mesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  private detectWithMesh() {
    if (!this.mesh) return Promise.resolve<FaceMeshResult | null>(null);
    return new Promise<FaceMeshResult | null>((resolve) => {
      this.mesh!.onResults((results) => resolve(results));
      this.mesh!
        .send({ image: this.analysisCanvas })
        .catch(() => resolve(null));
    });
  }

  private getLightingGuidance(video: HTMLVideoElement) {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      return { dark: false, backlight: false };
    }

    this.lightingCtx.drawImage(video, 0, 0, this.lightingCanvas.width, this.lightingCanvas.height);
    const img = this.lightingCtx.getImageData(0, 0, this.lightingCanvas.width, this.lightingCanvas.height).data;

    let center = 0;
    let edge = 0;
    let centerCount = 0;
    let edgeCount = 0;

    for (let y = 0; y < this.lightingCanvas.height; y += 2) {
      for (let x = 0; x < this.lightingCanvas.width; x += 2) {
        const idx = (y * this.lightingCanvas.width + x) * 4;
        const lum = img[idx] * 0.2126 + img[idx + 1] * 0.7152 + img[idx + 2] * 0.0722;
        const inCenter = x > 40 && x < 120 && y > 20 && y < 70;
        if (inCenter) {
          center += lum;
          centerCount++;
        } else {
          edge += lum;
          edgeCount++;
        }
      }
    }

    const centerAvg = center / Math.max(centerCount, 1);
    const edgeAvg = edge / Math.max(edgeCount, 1);

    return {
      dark: centerAvg < 60,
      backlight: edgeAvg > centerAvg * 1.35
    };
  }

  private getExpandedRoi(frameW: number, frameH: number) {
    if (!this.roi) {
      return { x: 0, y: 0, width: frameW, height: frameH };
    }
    const cx = this.roi.x + this.roi.width / 2;
    const cy = this.roi.y + this.roi.height / 2;
    const width = clamp(this.roi.width * ZOOM_SCALE, 120, frameW);
    const height = clamp(this.roi.height * ZOOM_SCALE, 120, frameH);
    const x = clamp(cx - width / 2, 0, frameW - width);
    const y = clamp(cy - height / 2, 0, frameH - height);
    return { x, y, width, height };
  }

  async estimate(video: HTMLVideoElement, baseline: BaselinePose | null): Promise<AttentionReading> {
    if (!this.mesh || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return {
        facePresent: false,
        confidence: 0,
        yaw: 0,
        pitch: 0,
        attention: 'uncertain',
        guidance: ['Camera is still warming up.']
      };
    }

    const frameW = video.videoWidth;
    const frameH = video.videoHeight;
    const roi = this.getExpandedRoi(frameW, frameH);
    this.analysisCtx.drawImage(video, roi.x, roi.y, roi.width, roi.height, 0, 0, INPUT_SIZE, INPUT_SIZE);

    const result = await this.detectWithMesh();
    const landmarks = result?.multiFaceLandmarks?.[0];
    const lighting = this.getLightingGuidance(video);

    if (!landmarks || landmarks.length < 10) {
      return {
        facePresent: false,
        confidence: 0,
        yaw: 0,
        pitch: 0,
        attention: 'uncertain',
        guidance: [
          'Move closer to camera.',
          ...(lighting.dark ? ['Lighting too dark'] : []),
          ...(lighting.backlight ? ['Strong backlight detected'] : [])
        ]
      };
    }

    const mapped = landmarks.map((p) => ({
      x: (roi.x + p.x * roi.width) / frameW,
      y: (roi.y + p.y * roi.height) / frameH,
      z: p.z
    }));

    const xs = mapped.map((p) => p.x);
    const ys = mapped.map((p) => p.y);
    const minX = clamp(Math.min(...xs), 0, 1);
    const maxX = clamp(Math.max(...xs), 0, 1);
    const minY = clamp(Math.min(...ys), 0, 1);
    const maxY = clamp(Math.max(...ys), 0, 1);

    const boxW = maxX - minX;
    const boxH = maxY - minY;
    this.roi = {
      x: minX * frameW,
      y: minY * frameH,
      width: boxW * frameW,
      height: boxH * frameH
    };

    const leftEye = mapped[33] ?? mapped[159] ?? mapped[130] ?? mapped[0];
    const rightEye = mapped[263] ?? mapped[386] ?? mapped[359] ?? mapped[0];
    const nose = mapped[1] ?? mapped[4] ?? mapped[0];

    const eyesMidX = (leftEye.x + rightEye.x) / 2;
    const eyesMidY = (leftEye.y + rightEye.y) / 2;

    const yaw = nose.x - eyesMidX;
    const pitch = nose.y - eyesMidY;

    let landmarkStability = 0.7;
    if (this.previousLandmarks) {
      let sumDelta = 0;
      const count = Math.min(this.previousLandmarks.length, mapped.length);
      for (let i = 0; i < count; i++) {
        sumDelta += Math.hypot(
          mapped[i].x - this.previousLandmarks[i].x,
          mapped[i].y - this.previousLandmarks[i].y
        );
      }
      const meanDelta = sumDelta / Math.max(count, 1);
      landmarkStability = clamp(1 - meanDelta * 18, 0, 1);
    }
    this.previousLandmarks = mapped;

    const sizeScore = clamp((boxW * boxH) / 0.12, 0, 1);
    const poseScore = clamp(1 - Math.abs(yaw) * 3 - Math.abs(pitch) * 2.5, 0, 1);
    const lightScore = lighting.dark ? 0.6 : 1;
    const confidence = clamp(sizeScore * 0.35 + landmarkStability * 0.35 + poseScore * 0.2 + lightScore * 0.1, 0, 1);

    const guidance: string[] = [];
    if (boxW * boxH < 0.07) guidance.push('Move closer to camera');
    if (minX < 0.02 || minY < 0.02 || maxX > 0.98 || maxY > 0.98) guidance.push('Face partially out of frame');
    if (lighting.dark) guidance.push('Lighting too dark');
    if (lighting.backlight) guidance.push('Strong backlight detected');

    if (!baseline) {
      return {
        facePresent: true,
        confidence,
        yaw,
        pitch,
        attention: 'uncertain',
        guidance
      };
    }

    const yawDelta = Math.abs(yaw - baseline.yaw);
    const pitchDelta = Math.abs(pitch - baseline.pitch);
    const away = yawDelta > 0.12 || pitchDelta > 0.12;

    return {
      facePresent: true,
      confidence,
      yaw,
      pitch,
      attention: confidence < 0.35 ? 'uncertain' : away ? 'away' : 'focused',
      guidance
    };
  }

  static buildCalibration(readings: AttentionReading[]): CalibrationReport {
    if (!readings.length) {
      return { ok: false, reason: 'No calibration frames captured.', confidence: 0, baseline: null };
    }

    const presentFrames = readings.filter((r) => r.facePresent);
    const requiredFrames = Math.ceil(readings.length * 0.65);
    if (presentFrames.length < requiredFrames) {
      return {
        ok: false,
        reason: `Face detected in ${presentFrames.length}/${readings.length} frames.`,
        confidence: presentFrames.length / readings.length,
        baseline: null
      };
    }

    const avgYaw = presentFrames.reduce((sum, r) => sum + r.yaw, 0) / presentFrames.length;
    const avgPitch = presentFrames.reduce((sum, r) => sum + r.pitch, 0) / presentFrames.length;
    const avgConfidence = presentFrames.reduce((sum, r) => sum + r.confidence, 0) / presentFrames.length;
    const meanDrift =
      presentFrames.reduce((sum, r) => sum + Math.abs(r.yaw - avgYaw) + Math.abs(r.pitch - avgPitch), 0) /
      presentFrames.length;
    const stability = clamp(1 - meanDrift * 8, 0, 1);

    const finalConfidence = clamp(avgConfidence * 0.6 + stability * 0.4, 0, 1);
    if (finalConfidence < 0.45) {
      return {
        ok: false,
        reason: 'Calibration quality is unstable. Keep your head centered for 2–3 seconds.',
        confidence: finalConfidence,
        baseline: null
      };
    }

    return {
      ok: true,
      confidence: finalConfidence,
      reason: '',
      baseline: {
        centerX: 0.5,
        centerY: 0.5,
        yaw: avgYaw,
        pitch: avgPitch
      }
    };
  }
}
