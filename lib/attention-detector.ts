import { AttentionReading, BaselinePose, CalibrationReport, PixelBox } from '@/lib/types';

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
const ROI_PADDING = 1.3;
const MIN_CALIBRATION_DETECTION_RATE = 0.65;
const MIN_CALIBRATION_CONFIDENCE = 0.55;
const LEFT_EYE = [33, 133, 159, 145, 468, 469, 470, 471, 472] as const;
const RIGHT_EYE = [362, 263, 386, 374, 473, 474, 475, 476, 477] as const;

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
  private manualZoom = 1;

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

  setManualZoom(multiplier: number) {
    this.manualZoom = clamp(multiplier, 1, 2);
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

  private getDetectionRoi(frameW: number, frameH: number) {
    if (!this.roi) {
      return { x: 0, y: 0, width: frameW, height: frameH };
    }
    const cx = this.roi.x + this.roi.width / 2;
    const cy = this.roi.y + this.roi.height / 2;
    const zoomedW = clamp(this.roi.width * ROI_PADDING * this.manualZoom, 120, frameW);
    const zoomedH = clamp(this.roi.height * ROI_PADDING * this.manualZoom, 120, frameH);
    return {
      x: clamp(cx - zoomedW / 2, 0, frameW - zoomedW),
      y: clamp(cy - zoomedH / 2, 0, frameH - zoomedH),
      width: zoomedW,
      height: zoomedH
    };
  }

  private getEyeMetrics(mapped: Landmark[]) {
    const leftInner = mapped[LEFT_EYE[1]] ?? mapped[LEFT_EYE[0]];
    const leftOuter = mapped[LEFT_EYE[0]] ?? mapped[LEFT_EYE[1]];
    const rightInner = mapped[RIGHT_EYE[0]] ?? mapped[RIGHT_EYE[1]];
    const rightOuter = mapped[RIGHT_EYE[1]] ?? mapped[RIGHT_EYE[0]];

    const leftTop = mapped[LEFT_EYE[2]] ?? mapped[LEFT_EYE[0]];
    const leftBottom = mapped[LEFT_EYE[3]] ?? mapped[LEFT_EYE[1]];
    const rightTop = mapped[RIGHT_EYE[2]] ?? mapped[RIGHT_EYE[0]];
    const rightBottom = mapped[RIGHT_EYE[3]] ?? mapped[RIGHT_EYE[1]];

    const leftPupil = mapped[LEFT_EYE[8]] ?? mapped[LEFT_EYE[0]];
    const rightPupil = mapped[RIGHT_EYE[8]] ?? mapped[RIGHT_EYE[0]];

    const leftCenterX = (leftInner.x + leftOuter.x) / 2;
    const rightCenterX = (rightInner.x + rightOuter.x) / 2;
    const leftCenterY = (leftTop.y + leftBottom.y) / 2;
    const rightCenterY = (rightTop.y + rightBottom.y) / 2;

    const eyeCenterX = (leftCenterX + rightCenterX) / 2;
    const eyeCenterY = (leftCenterY + rightCenterY) / 2;

    const leftOpen = Math.abs(leftTop.y - leftBottom.y) / Math.max(Math.abs(leftInner.x - leftOuter.x), 0.001);
    const rightOpen = Math.abs(rightTop.y - rightBottom.y) / Math.max(Math.abs(rightInner.x - rightOuter.x), 0.001);
    const eyeOpenRatio = (leftOpen + rightOpen) / 2;

    const gazeLeft = (leftPupil.x - leftCenterX) / Math.max(Math.abs(leftInner.x - leftOuter.x), 0.001);
    const gazeRight = (rightPupil.x - rightCenterX) / Math.max(Math.abs(rightInner.x - rightOuter.x), 0.001);
    const gazeUp =
      ((leftPupil.y - leftCenterY) + (rightPupil.y - rightCenterY)) /
      (Math.max(Math.abs(leftTop.y - leftBottom.y), 0.001) + Math.max(Math.abs(rightTop.y - rightBottom.y), 0.001));

    return {
      eyeCenterX,
      eyeCenterY,
      eyeOpenRatio,
      eyeDirectionX: (gazeLeft + gazeRight) / 2,
      eyeDirectionY: gazeUp
    };
  }

  async estimate(video: HTMLVideoElement, baseline: BaselinePose | null): Promise<AttentionReading> {
    if (!this.mesh || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return {
        facePresent: false,
        confidence: 0,
        yaw: 0,
        pitch: 0,
        attention: 'uncertain',
        guidance: ['Camera is still warming up.'],
        faceBox: null,
        eyeDirectionX: 0,
        eyeDirectionY: 0,
        eyeOpenRatio: 0
      };
    }

    const frameW = video.videoWidth;
    const frameH = video.videoHeight;
    const roi = this.getDetectionRoi(frameW, frameH);
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
          'Low detection confidence',
          'Face too small — move closer',
          ...(lighting.dark ? ['Lighting issue — face too dark or backlit'] : [])
        ],
        faceBox: null,
        eyeDirectionX: 0,
        eyeDirectionY: 0,
        eyeOpenRatio: 0
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

    const faceBox: PixelBox = {
      x: minX * frameW,
      y: minY * frameH,
      width: (maxX - minX) * frameW,
      height: (maxY - minY) * frameH
    };
    this.roi = faceBox;

    const leftEye = mapped[33] ?? mapped[0];
    const rightEye = mapped[263] ?? mapped[0];
    const nose = mapped[1] ?? mapped[4] ?? mapped[0];

    const yaw = nose.x - (leftEye.x + rightEye.x) / 2;
    const pitch = nose.y - (leftEye.y + rightEye.y) / 2;

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
      landmarkStability = clamp(1 - (sumDelta / Math.max(count, 1)) * 18, 0, 1);
    }
    this.previousLandmarks = mapped;

    const eyeMetrics = this.getEyeMetrics(mapped);

    const sizeScore = clamp((faceBox.width * faceBox.height) / (frameW * frameH * 0.12), 0, 1);
    const poseScore = clamp(1 - Math.abs(yaw) * 3 - Math.abs(pitch) * 2.5, 0, 1);
    const eyeOpenScore = clamp(eyeMetrics.eyeOpenRatio / 0.13, 0, 1);
    const lightScore = lighting.dark ? 0.6 : 1;
    const confidence = clamp(sizeScore * 0.3 + landmarkStability * 0.3 + poseScore * 0.2 + eyeOpenScore * 0.1 + lightScore * 0.1, 0, 1);

    const guidance: string[] = [];
    if (sizeScore < 0.45) guidance.push('Face too small — move closer');
    if (minX < 0.02 || minY < 0.02 || maxX > 0.98 || maxY > 0.98) guidance.push('Face partially out of frame');
    if (lighting.dark || lighting.backlight) guidance.push('Lighting issue — face too dark or backlit');
    if (confidence < 0.45) guidance.push('Low detection confidence');

    if (!baseline) {
      return {
        facePresent: true,
        confidence,
        yaw,
        pitch,
        attention: 'uncertain',
        guidance,
        faceBox,
        eyeDirectionX: eyeMetrics.eyeDirectionX,
        eyeDirectionY: eyeMetrics.eyeDirectionY,
        eyeOpenRatio: eyeMetrics.eyeOpenRatio
      };
    }

    const yawDelta = Math.abs(yaw - baseline.yaw);
    const pitchDelta = Math.abs(pitch - baseline.pitch);
    const eyeDeltaX = Math.abs(eyeMetrics.eyeDirectionX);
    const eyeDeltaY = Math.abs(eyeMetrics.eyeDirectionY);
    const eyesClosed = eyeMetrics.eyeOpenRatio < baseline.eyeOpenRatio * 0.45;

    let attention: AttentionReading['attention'] = 'focused';
    if (confidence < 0.35) {
      attention = 'uncertain';
    } else if (yawDelta > 0.14 || pitchDelta > 0.14 || eyeDeltaX > 0.26 || eyeDeltaY > 0.3 || eyesClosed) {
      attention = 'offscreen';
    } else if (yawDelta > 0.08 || pitchDelta > 0.08 || eyeDeltaX > 0.18 || eyeDeltaY > 0.22) {
      attention = 'warning';
      guidance.push('Eye tracking unstable');
    }

    return {
      facePresent: true,
      confidence,
      yaw,
      pitch,
      attention,
      guidance,
      faceBox,
      eyeDirectionX: eyeMetrics.eyeDirectionX,
      eyeDirectionY: eyeMetrics.eyeDirectionY,
      eyeOpenRatio: eyeMetrics.eyeOpenRatio
    };
  }

  static buildCalibration(readings: AttentionReading[], frameW: number, frameH: number): CalibrationReport {
    if (!readings.length) {
      return { ok: false, reason: 'No calibration frames captured.', confidence: 0, baseline: null, sampleCount: 0, detectionRate: 0 };
    }

    const presentFrames = readings.filter((r) => r.facePresent && r.faceBox);
    const detectionRate = presentFrames.length / readings.length;
    if (detectionRate < MIN_CALIBRATION_DETECTION_RATE) {
      return {
        ok: false,
        reason: `Face detected in ${presentFrames.length}/${readings.length} frames. Hold still and center your face.`,
        confidence: detectionRate,
        baseline: null,
        sampleCount: readings.length,
        detectionRate
      };
    }

    const avgConfidence = presentFrames.reduce((sum, r) => sum + r.confidence, 0) / presentFrames.length;
    if (avgConfidence < MIN_CALIBRATION_CONFIDENCE) {
      return {
        ok: false,
        reason: 'Low detection confidence. Improve lighting and move closer.',
        confidence: avgConfidence,
        baseline: null,
        sampleCount: readings.length,
        detectionRate
      };
    }

    const avg = <K extends keyof AttentionReading>(key: K) =>
      presentFrames.reduce((sum, r) => sum + (r[key] as number), 0) / presentFrames.length;

    const meanBox = presentFrames.reduce(
      (acc, r) => {
        const box = r.faceBox!;
        acc.x += box.x;
        acc.y += box.y;
        acc.width += box.width;
        acc.height += box.height;
        return acc;
      },
      { x: 0, y: 0, width: 0, height: 0 }
    );

    const baseline: BaselinePose = {
      centerX: clamp((meanBox.x / presentFrames.length + meanBox.width / presentFrames.length / 2) / frameW, 0, 1),
      centerY: clamp((meanBox.y / presentFrames.length + meanBox.height / presentFrames.length / 2) / frameH, 0, 1),
      yaw: avg('yaw'),
      pitch: avg('pitch'),
      eyeCenterX: avg('eyeDirectionX'),
      eyeCenterY: avg('eyeDirectionY'),
      eyeOpenRatio: avg('eyeOpenRatio'),
      faceBox: {
        x: meanBox.x / presentFrames.length,
        y: meanBox.y / presentFrames.length,
        width: meanBox.width / presentFrames.length,
        height: meanBox.height / presentFrames.length
      }
    };

    return {
      ok: true,
      confidence: avgConfidence,
      reason: '',
      baseline,
      sampleCount: readings.length,
      detectionRate
    };
  }
}
