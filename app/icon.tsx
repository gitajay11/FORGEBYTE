import { ImageResponse } from 'next/og';

// Favicon: the navbar's logo mark — blue braces on a dark rounded square.
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0C10',
          border: '3px solid #2A3140',
          borderRadius: 14,
          color: '#7CA9FF',
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 2,
          fontFamily: 'monospace',
          paddingBottom: 4,
        }}
      >
        {'{}'}
      </div>
    ),
    { ...size }
  );
}
