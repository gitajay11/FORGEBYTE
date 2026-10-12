'use client';

import dynamic from 'next/dynamic';

// Code-split islands that don't affect first paint: decorative canvases
// (absolutely positioned inside fixed-size boxes, so no layout shift),
// scroll choreography, the chat widget and the custom cursor. Each loads right
// after hydration instead of in the initial bundle — keeps first-load JS
// inside the brief's budget.

export const LazyPortrait = dynamic(() => import('./home/Portrait'), { ssr: false });
export const LazyConstellation = dynamic(() => import('./home/Constellation'), {
  ssr: false,
  loading: () => <div className="constellation" aria-hidden="true" />,
});
export const LazyProcessPin = dynamic(() => import('./home/ScrollStories').then((m) => m.ProcessPin), { ssr: false });
export const LazyChat = dynamic(() => import('./ChatWidget'), { ssr: false });
export const LazyCursor = dynamic(() => import('./site/Cursor'), { ssr: false });
export const LazyLostScene = dynamic(() => import('./lab/LostScene'), { ssr: false });
