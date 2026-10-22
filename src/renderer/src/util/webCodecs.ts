/**
 * WebCodecs hardware-accelerated video decoding utility.
 * Leverages native Chromium / Electron VideoDecoder APIs for zero-copy frame extraction
 * and fast thumbnail generation without spawning external FFmpeg subprocesses.
 */

export interface CodecSupportResult {
  supported: boolean;
  powerPreference?: 'default' | 'low-power' | 'high-performance' | undefined;
  hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software' | undefined;
}

/**
 * Checks if the Chromium WebCodecs API is available in the current environment.
 */
export function isWebCodecsSupported(): boolean {
  return typeof globalThis !== 'undefined' && 'VideoDecoder' in globalThis && 'VideoFrame' in globalThis;
}

/**
 * Probes the GPU / system decoder for hardware acceleration support of a given codec string.
 * @param codecString e.g. 'avc1.640028' (H.264 High 4.0), 'vp09.00.10.08' (VP9), 'hev1.1.6.L93.B0' (HEVC), 'av01.0.08M.10' (AV1)
 * @param width optional video width
 * @param height optional video height
 */
export async function probeHardwareAcceleration(
  codecString: string,
  width = 1920,
  height = 1080,
): Promise<CodecSupportResult> {
  if (!isWebCodecsSupported()) {
    return { supported: false };
  }

  try {
    const config: VideoDecoderConfig = {
      codec: codecString,
      codedWidth: width,
      codedHeight: height,
      hardwareAcceleration: 'prefer-hardware',
    };

    const status = await VideoDecoder.isConfigSupported(config);
    return {
      supported: Boolean(status.supported),
      hardwareAcceleration: status.config?.hardwareAcceleration,
    };
  } catch {
    return { supported: false };
  }
}

/**
 * Extracts a canvas or ImageBitmap from an active HTMLVideoElement using hardware-accelerated VideoFrame API.
 */
export async function captureVideoFrameViaWebCodecs(
  videoElement: HTMLVideoElement,
): Promise<ImageBitmap | null> {
  if (!isWebCodecsSupported() || videoElement.readyState < 2) {
    return null;
  }

  try {
    const frame = new VideoFrame(videoElement);
    const bitmap = await createImageBitmap(frame);
    frame.close();
    return bitmap;
  } catch (err) {
    console.debug('WebCodecs frame extraction fallback to canvas 2d', err);
    return null;
  }
}
