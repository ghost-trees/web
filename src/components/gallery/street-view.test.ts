import { describe, expect, it } from 'vitest';
import { buildStreetViewUrl } from './street-view';

describe('buildStreetViewUrl', () => {
  it('builds a URL with required parameters and defaults', () => {
    const url = buildStreetViewUrl({ panoId: 'PANO_123', apiKey: 'KEY_ABC' });
    expect(url).not.toBeNull();

    const parsed = new URL(url as string);
    expect(parsed.origin + parsed.pathname).toBe('https://maps.googleapis.com/maps/api/streetview');
    expect(parsed.searchParams.get('pano')).toBe('PANO_123');
    expect(parsed.searchParams.get('key')).toBe('KEY_ABC');
    expect(parsed.searchParams.get('size')).toBe('800x600');
    expect(parsed.searchParams.get('return_error_code')).toBe('true');
  });

  it('includes optional camera parameters when provided', () => {
    const url = buildStreetViewUrl({
      panoId: 'PANO_123',
      apiKey: 'KEY_ABC',
      heading: 151.78,
      pitch: -0.76,
      fov: 90,
      size: '640x480',
    });

    const parsed = new URL(url as string);
    expect(parsed.searchParams.get('heading')).toBe('151.78');
    expect(parsed.searchParams.get('pitch')).toBe('-0.76');
    expect(parsed.searchParams.get('fov')).toBe('90');
    expect(parsed.searchParams.get('size')).toBe('640x480');
  });

  it('omits camera parameters that are not provided', () => {
    const url = buildStreetViewUrl({ panoId: 'PANO_123', apiKey: 'KEY_ABC' });
    const parsed = new URL(url as string);
    expect(parsed.searchParams.has('heading')).toBe(false);
    expect(parsed.searchParams.has('pitch')).toBe(false);
    expect(parsed.searchParams.has('fov')).toBe(false);
  });

  it('returns null when the API key is missing', () => {
    expect(buildStreetViewUrl({ panoId: 'PANO_123', apiKey: undefined })).toBeNull();
    expect(buildStreetViewUrl({ panoId: 'PANO_123', apiKey: '' })).toBeNull();
  });

  it('returns null when the panorama ID is missing', () => {
    expect(buildStreetViewUrl({ panoId: '', apiKey: 'KEY_ABC' })).toBeNull();
  });
});
