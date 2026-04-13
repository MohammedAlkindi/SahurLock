import { AttentionReading, BaselinePose } from '@/lib/types';

interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type BrowserFaceDetector = {
  detect: (input: HTMLVideoElement) => Promise<Array<{ boundingBox: FaceBox }>>;
};

declare global {
  interface Window {
    FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => BrowserFaceDetector;
  }
}

export class AttentionDetector {
  private detector: BrowserFaceDetector | null = null;

  async init() {
    if (!window.FaceDetector) return;
    this.detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  }

  async estimate(video: HTMLVideoElement, baseline: BaselinePose | null): Promise<AttentionReading> {
    if (!this.detector) {
      return {
        facePresent: false,
        confidence: 0,
        yaw: 0,
        pitch: 0,
        attention: 'uncertain'
      };
    }

    const faces = await this.detector.detect(video);
    const face = faces[0]?.boundingBox;
    if (!face) {
      return { facePresent: false, confidence: 0.1, yaw: 0, pitch: 0, attention: 'away' };
    }

    const frameW = video.videoWidth || 1;
    const frameH = video.videoHeight || 1;

    const centerX = (face.x + face.width / 2) / frameW;
    const centerY = (face.y + face.height / 2) / frameH;

    const yaw = centerX - 0.5;
    const pitch = centerY - 0.5;

    const areaRatio = (face.width * face.height) / (frameW * frameH);
    const confidence = Math.max(0.2, Math.min(1, areaRatio * 8));

    if (!baseline) {
      return { facePresent: true, confidence, yaw, pitch, attention: 'uncertain' };
    }

    const yawDelta = Math.abs(yaw - baseline.yaw);
    const pitchDelta = Math.abs(pitch - baseline.pitch);

    const uncertain = confidence < 0.3;
    const away = yawDelta > 0.13 || pitchDelta > 0.13;

    return {
      facePresent: true,
      confidence,
      yaw,
      pitch,
      attention: uncertain ? 'uncertain' : away ? 'away' : 'focused'
    };
  }

  static captureBaseline(readings: AttentionReading[]) {
    const stable = readings.filter((r) => r.facePresent);
    if (!stable.length) return null;
    return {
      centerX: 0.5,
      centerY: 0.5,
      yaw: stable.reduce((sum, r) => sum + r.yaw, 0) / stable.length,
      pitch: stable.reduce((sum, r) => sum + r.pitch, 0) / stable.length
    };
  }
}
