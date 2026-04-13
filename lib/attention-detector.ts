import { AttentionReading, BaselinePose, CalibrationReport, EyeData, PixelBox } from '@/lib/types';

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
const LANDMARK_SMOOTH = 0.38; // EMA alpha for landmark smoothing (lower = smoother)

// Key eye landmarks: [outer, inner, top, bottom, iris_center, iris_top, iris_bottom, iris_right, iris_left]
const LEFT_EYE  = [33,  133, 159, 145, 468, 469, 470, 471, 472] as const;
const RIGHT_EYE = [362, 263, 386, 374, 473, 474, 475, 476, 477] as const;

// Full eyelid contour landmarks (MediaPipe Face Mesh v2 with refineLandmarks=true)
const LEFT_CONTOUR  = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
const RIGHT_CONTOUR = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

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
  private smoothedLandmarks: Landmark[] | null = null;
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
    // Higher zoom = smaller ROI = face fills more of the analysis canvas = better iris detection
    const zoomedW = clamp(this.roi.width * ROI_PADDING / this.manualZoom, 80, frameW);
    const zoomedH = clamp(this.roi.height * ROI_PADDING / this.manualZoom, 80, frameH);
    return {
      x: clamp(cx - zoomedW / 2, 0, frameW - zoomedW),
      y: clamp(cy - zoomedH / 2, 0, frameH - zoomedH),
      width: zoomedW,
      height: zoomedH
    };
  }

  private getEyeMetrics(raw: Landmark[], vis: Landmark[]) {
    // -- Detection uses raw landmarks for accuracy --
    const lOuter = raw[LEFT_EYE[0]];
    const lInner = raw[LEFT_EYE[1]];
    const lTop   = raw[LEFT_EYE[2]];
    const lBot   = raw[LEFT_EYE[3]];
    const lIris  = raw[LEFT_EYE[4]]; // iris center 468

    const rOuter = raw[RIGHT_EYE[0]];
    const rInner = raw[RIGHT_EYE[1]];
    const rTop   = raw[RIGHT_EYE[2]];
    const rBot   = raw[RIGHT_EYE[3]];
    const rIris  = raw[RIGHT_EYE[4]]; // iris center 473

    const lW = Math.max(Math.abs(lOuter.x - lInner.x), 0.001);
    const rW = Math.max(Math.abs(rOuter.x - rInner.x), 0.001);
    const lH = Math.max(Math.abs(lTop.y - lBot.y), 0.001);
    const rH = Math.max(Math.abs(rTop.y - rBot.y), 0.001);

    const lCX = (lOuter.x + lInner.x) / 2;
    const lCY = (lTop.y  + lBot.y)   / 2;
    const rCX = (rOuter.x + rInner.x) / 2;
    const rCY = (rTop.y  + rBot.y)   / 2;

    const leftOpenRatio  = lH / lW;
    const rightOpenRatio = rH / rW;
    const eyeOpenRatio   = (leftOpenRatio + rightOpenRatio) / 2;

    const gazeLX = (lIris.x - lCX) / lW;
    const gazeRX = (rIris.x - rCX) / rW;
    const gazeLY = (lIris.y - lCY) / lH;
    const gazeRY = (rIris.y - rCY) / rH;

    const eyeCenterX = (lCX + rCX) / 2;
    const eyeCenterY = (lCY + rCY) / 2;

    // -- Visualization uses smoothed landmarks --
    const vlOuter = vis[LEFT_EYE[0]];
    const vlInner = vis[LEFT_EYE[1]];
    const vlTop   = vis[LEFT_EYE[2]];
    const vlBot   = vis[LEFT_EYE[3]];
    const vlIris  = vis[LEFT_EYE[4]];
    // Iris edge points for radius measurement
    const vlIrisT = vis[LEFT_EYE[5]];
    const vlIrisB = vis[LEFT_EYE[6]];
    const vlIrisR = vis[LEFT_EYE[7]];
    const vlIrisL = vis[LEFT_EYE[8]];

    const vrOuter = vis[RIGHT_EYE[0]];
    const vrInner = vis[RIGHT_EYE[1]];
    const vrTop   = vis[RIGHT_EYE[2]];
    const vrBot   = vis[RIGHT_EYE[3]];
    const vrIris  = vis[RIGHT_EYE[4]];
    const vrIrisT = vis[RIGHT_EYE[5]];
    const vrIrisB = vis[RIGHT_EYE[6]];
    const vrIrisR = vis[RIGHT_EYE[7]];
    const vrIrisL = vis[RIGHT_EYE[8]];

    const leftIrisRadius = (
      Math.hypot(vlIrisT.x - vlIris.x, vlIrisT.y - vlIris.y) +
      Math.hypot(vlIrisB.x - vlIris.x, vlIrisB.y - vlIris.y) +
      Math.hypot(vlIrisR.x - vlIris.x, vlIrisR.y - vlIris.y) +
      Math.hypot(vlIrisL.x - vlIris.x, vlIrisL.y - vlIris.y)
    ) / 4;

    const rightIrisRadius = (
      Math.hypot(vrIrisT.x - vrIris.x, vrIrisT.y - vrIris.y) +
      Math.hypot(vrIrisB.x - vrIris.x, vrIrisB.y - vrIris.y) +
      Math.hypot(vrIrisR.x - vrIris.x, vrIrisR.y - vrIris.y) +
      Math.hypot(vrIrisL.x - vrIris.x, vrIrisL.y - vrIris.y)
    ) / 4;

    const vlCX = (vlOuter.x + vlInner.x) / 2;
    const vlCY = (vlTop.y   + vlBot.y)   / 2;
    const vrCX = (vrOuter.x + vrInner.x) / 2;
    const vrCY = (vrTop.y   + vrBot.y)   / 2;
    const vlW  = Math.max(Math.abs(vlOuter.x - vlInner.x), 0.001);
    const vrW  = Math.max(Math.abs(vrOuter.x - vrInner.x), 0.001);
    const vlH  = Math.max(Math.abs(vlTop.y  - vlBot.y),   0.001);
    const vrH  = Math.max(Math.abs(vrTop.y  - vrBot.y),   0.001);

    // Gaze direction vectors per eye (iris offset from eye center, normalized)
    const lGX = (vlIris.x - vlCX) / vlW;
    const lGY = (vlIris.y - vlCY) / vlH;
    const rGX = (vrIris.x - vrCX) / vrW;
    const rGY = (vrIris.y - vrCY) / vrH;

    // Full eyelid contours for drawing
    const leftContour  = LEFT_CONTOUR.map(i  => ({ x: vis[i]?.x ?? 0, y: vis[i]?.y ?? 0 }));
    const rightContour = RIGHT_CONTOUR.map(i => ({ x: vis[i]?.x ?? 0, y: vis[i]?.y ?? 0 }));

    const lPad = vlH * 0.55;
    const rPad = vrH * 0.55;

    const leftEye: EyeData = {
      x: Math.min(vlOuter.x, vlInner.x) - lPad,
      y: vlTop.y - lPad,
      width: vlW + lPad * 2,
      height: vlH + lPad * 2,
      irisX: vlIris.x,
      irisY: vlIris.y,
      irisRadius: leftIrisRadius,
      gazeX: lGX,
      gazeY: lGY,
      openRatio: leftOpenRatio,
      contour: leftContour
    };
    const rightEye: EyeData = {
      x: Math.min(vrOuter.x, vrInner.x) - rPad,
      y: vrTop.y - rPad,
      width: vrW + rPad * 2,
      height: vrH + rPad * 2,
      irisX: vrIris.x,
      irisY: vrIris.y,
      irisRadius: rightIrisRadius,
      gazeX: rGX,
      gazeY: rGY,
      openRatio: rightOpenRatio,
      contour: rightContour
    };

    return {
      eyeCenterX,
      eyeCenterY,
      eyeOpenRatio,
      eyeDirectionX: (gazeLX + gazeRX) / 2,
      eyeDirectionY: (gazeLY + gazeRY) / 2,
      leftEye,
      rightEye
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
        eyeOpenRatio: 0,
        leftEye: null,
        rightEye: null
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
      this.smoothedLandmarks = null; // reset so next detection starts fresh
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
        eyeOpenRatio: 0,
        leftEye: null,
        rightEye: null
      };
    }

    const mapped = landmarks.map((p) => ({
      x: (roi.x + p.x * roi.width) / frameW,
      y: (roi.y + p.y * roi.height) / frameH,
      z: p.z
    }));

    // EMA smoothing for visualization — keeps iris/contour rendering stable
    if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== mapped.length) {
      this.smoothedLandmarks = mapped.map(p => ({ ...p }));
    } else {
      for (let i = 0; i < mapped.length; i++) {
        this.smoothedLandmarks[i].x += LANDMARK_SMOOTH * (mapped[i].x - this.smoothedLandmarks[i].x);
        this.smoothedLandmarks[i].y += LANDMARK_SMOOTH * (mapped[i].y - this.smoothedLandmarks[i].y);
        this.smoothedLandmarks[i].z  = mapped[i].z;
      }
    }
    const vis = this.smoothedLandmarks;

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

    const eyeMetrics = this.getEyeMetrics(mapped, vis);

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
        eyeOpenRatio: eyeMetrics.eyeOpenRatio,
        leftEye: eyeMetrics.leftEye,
        rightEye: eyeMetrics.rightEye
      };
    }

    // Eye gaze delta: compare against calibration baseline (not absolute zero)
    const eyeDeltaX = Math.abs(eyeMetrics.eyeDirectionX - baseline.eyeCenterX);
    const eyeDeltaY = Math.abs(eyeMetrics.eyeDirectionY - baseline.eyeCenterY);
    const eyesClosed = eyeMetrics.eyeOpenRatio < baseline.eyeOpenRatio * 0.45;

    // Head pose as secondary context — only extreme turns matter
    const yawDelta = Math.abs(yaw - baseline.yaw);
    const pitchDelta = Math.abs(pitch - baseline.pitch);
    const extremeHeadTurn = yawDelta > 0.22 || pitchDelta > 0.20;
    const moderateHeadTurn = yawDelta > 0.15 || pitchDelta > 0.13;

    let attention: AttentionReading['attention'] = 'focused';
    if (confidence < 0.35) {
      attention = 'uncertain';
    } else if (eyesClosed || eyeDeltaX > 0.20 || eyeDeltaY > 0.25 || extremeHeadTurn) {
      // Eye gaze has moved significantly away from calibration position, or extreme head turn
      attention = 'offscreen';
    } else if (eyeDeltaX > 0.12 || eyeDeltaY > 0.16 || moderateHeadTurn) {
      // Moderate eye gaze shift or moderate head turn
      attention = 'warning';
      guidance.push('Gaze shifted — look at the screen');
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
      eyeOpenRatio: eyeMetrics.eyeOpenRatio,
      leftEye: eyeMetrics.leftEye,
      rightEye: eyeMetrics.rightEye
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
