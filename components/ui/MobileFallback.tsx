'use client';

import ResumeView from './ResumeView';

/**
 * Rendered when the device can't do WebGL. The new résumé page (ResumeView)
 * is fully responsive and self-contained (own dark hero, nav, and sections),
 * so this fallback no longer needs its own hero banner / About / Contact /
 * Footer composition — it just hands off to ResumeView directly.
 */
export default function MobileFallback() {
  return <ResumeView />;
}
