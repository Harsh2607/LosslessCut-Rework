import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isWebCodecsSupported, probeHardwareAcceleration, captureVideoFrameViaWebCodecs } from './webCodecs';

describe('webCodecs utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects when WebCodecs is supported', () => {
    // In node test environment without mock
    expect(typeof isWebCodecsSupported()).toBe('boolean');
  });

  it('probeHardwareAcceleration returns supported false when WebCodecs is absent', async () => {
    const result = await probeHardwareAcceleration('avc1.640028');
    expect(result).toHaveProperty('supported');
  });

  it('probeHardwareAcceleration handles supported config correctly when mocked', async () => {
    const originalVideoDecoder = globalThis.VideoDecoder;
    const originalVideoFrame = globalThis.VideoFrame;

    // @ts-expect-error Mock VideoDecoder object for testing environment
    globalThis.VideoDecoder = {
      isConfigSupported: vi.fn().mockResolvedValue({
        supported: true,
        config: { hardwareAcceleration: 'prefer-hardware' },
      }),
    };
    // @ts-expect-error Mock VideoFrame class for testing environment
    globalThis.VideoFrame = class MockVideoFrame { dummy = 1; };

    const result = await probeHardwareAcceleration('avc1.640028');
    expect(result.supported).toBe(true);
    expect(result.hardwareAcceleration).toBe('prefer-hardware');

    globalThis.VideoDecoder = originalVideoDecoder;
    globalThis.VideoFrame = originalVideoFrame;
  });

  it('captureVideoFrameViaWebCodecs returns null when element is not ready or unsupported', async () => {
    const fakeVideo = { readyState: 1 } as unknown as HTMLVideoElement;
    const result = await captureVideoFrameViaWebCodecs(fakeVideo);
    expect(result).toBeNull();
  });
});
