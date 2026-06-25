import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAME = 'Saatvik Choudhary';
const HEADLINE =
  'Chip architect & full-stack engineer, from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#05060a',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Silicon-die grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(94,234,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Accent corner chip glyph */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '80px',
            width: '120px',
            height: '120px',
            border: '2px solid rgba(94,234,212,0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(94,234,212,0.06)',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              background: 'rgba(94,234,212,0.15)',
              border: '1.5px solid rgba(94,234,212,0.7)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#5eead4',
                fontSize: '22px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '-1px',
              }}
            >
              SC
            </span>
          </div>
        </div>

        {/* Teal accent bar */}
        <div
          style={{
            width: '64px',
            height: '4px',
            background: '#5eead4',
            borderRadius: '2px',
            marginBottom: '32px',
          }}
        />

        {/* Name */}
        <div
          style={{
            color: '#f8fafc',
            fontSize: '64px',
            fontWeight: 700,
            fontFamily: 'sans-serif',
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-1px',
          }}
        >
          {NAME}
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#94a3b8',
            fontSize: '26px',
            fontFamily: 'sans-serif',
            lineHeight: 1.5,
            maxWidth: '860px',
          }}
        >
          {HEADLINE}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#5eead4',
            }}
          />
          <span
            style={{
              color: '#5eead4',
              fontSize: '18px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            saatvik.dev
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
