import { ImageResponse } from 'next/og';

// Home-screen icon (iOS): the same mark as the favicon, full-bleed — iOS
// rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 40%, rgba(124,169,255,0.22), rgba(10,12,16,0) 60%), #0A0C10',
          color: '#7CA9FF',
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: 8,
          fontFamily: 'monospace',
          paddingBottom: 10,
        }}
      >
        {'{}'}
      </div>
    ),
    { ...size }
  );
}
