import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '32px',
          height: '32px',
          background: '#05060a',
          border: '1.5px solid #5eead4',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#5eead4',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '-0.5px',
          }}
        >
          SC
        </span>
      </div>
    ),
    { ...size },
  );
}
