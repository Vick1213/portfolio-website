'use client';

import { useTheme, type ThemeId } from '@/lib/themeStore';
import Reveal from './Reveal';

/**
 * Theme-aware art interlude between Selected Work and Experience. Each
 * alternate theme ships a generated art plate that anchors its aesthetic;
 * the default 'spec' view renders nothing (recruiter view stays lean), and
 * print hides it entirely. Images live in public/images/themes/.
 */
const ART: Partial<Record<ThemeId, { src: string; alt: string; caption: string }>> = {
  spec: {
    src: '/images/themes/spec.jpg',
    alt: 'Technical pen-and-ink exploded isometric diagram of a desktop PC build',
    caption: 'Fig. 01 — exploded assembly',
  },
  glass: {
    src: '/images/themes/glass.jpg',
    alt: 'Abstract frosted-glass panes refracting teal light in deep blue space',
    caption: 'Interlude — light through glass',
  },
  neo: {
    src: '/images/themes/neo.jpg',
    alt: 'Copperplate engraving of a classical cornice with acanthus ornament and ionic columns',
    caption: 'Interlude — plate IV, the cornice',
  },
  aurora: {
    src: '/images/themes/aurora.jpg',
    alt: 'Aurora borealis in teal, violet and magenta over dark mountain silhouettes',
    caption: 'Interlude — solar wind, 66°N',
  },
  brutal: {
    src: '/images/themes/brutal.jpg',
    alt: 'Raw concrete brutalist building in stark black and white',
    caption: 'Interlude — béton brut',
  },
  pixel: {
    src: '/images/themes/pixel.png',
    alt: 'Pixel-art workstation with an RGB PC tower, monitor and circuit boards at night',
    caption: 'Interlude — the rig, demade',
  },
};

export default function ThemeArt() {
  const theme = useTheme((s) => s.theme);
  const art = ART[theme];

  if (!art) return null;

  return (
    <section className="rz-art" aria-label="Theme artwork">
      <div className="rz-col">
        <Reveal>
          <figure className="rz-art-figure">
            <div className="rz-art-frame">
              <img
                src={art.src}
                alt={art.alt}
                width={2528}
                height={1088}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="rz-eyebrow rz-art-caption">{art.caption}</figcaption>
          </figure>
        </Reveal>
      </div>

      <style>{`
        .rz-art {
          padding-block: clamp(20px, 3vw, 40px) 0;
        }
        .rz-art-figure {
          margin: 0;
        }
        .rz-art-frame {
          border: var(--rz-card-border);
          border-radius: var(--rz-radius);
          box-shadow: var(--rz-card-shadow);
          overflow: hidden;
          line-height: 0;
        }
        /* Scoped to the interlude section — the hero reuses .rz-art-frame for
           its portrait plate and must not inherit this wide aspect-ratio. */
        .rz-art .rz-art-frame img {
          width: 100%;
          height: auto;
          aspect-ratio: 2528 / 1088;
          object-fit: cover;
          display: block;
        }
        .rz-art-caption {
          margin-top: 10px;
          text-align: right;
        }
        @media print {
          .rz-art { display: none !important; }
        }
      `}</style>
    </section>
  );
}
