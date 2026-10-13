// Server-rendered text splitters. They only emit markup; the reveal itself is
// CSS, triggered by SiteEffects adding `.in`. The full string stays in an
// sr-only span so screen readers read words, not fragments.

import { Fragment, type ElementType, type ReactNode } from 'react';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Word(s) to pick out in the brand colour with a soft marker. */
  highlight?: string | string[];
};

const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Word-by-word stagger with a slight rotateX. */
export function Words({ text, as: Tag = 'span', className = '', id, highlight }: Props) {
  const words = text.split(' ');
  const keys = new Set([highlight ?? []].flat().map(bare));
  return (
    <Tag className={`words ${className}`.trim()} id={id}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className={keys.has(bare(w)) ? 'w key' : 'w'} style={{ ['--i' as string]: i }}>
              <span>{w}</span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/** Mono metadata appearing character by character (no cursor, no sound). */
export function TypeIn({ text, as: Tag = 'span', className = '' }: Props) {
  return (
    <Tag className={`typein ${className}`.trim()}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((c, i) => (
          <span className="c" key={i} style={{ ['--i' as string]: i }}>
            {c}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/** Section index label: "[02] — SERVICES". */
export function Index({ n, label }: { n: string; label: string }) {
  return (
    <p className="index mono">
      <TypeIn text={`[${n}] — ${label}`} />
    </p>
  );
}

export function Reveal({
  as: Tag = 'div',
  variant,
  className,
  children,
  style,
}: {
  as?: ElementType;
  variant: 'clip-up' | 'clip-left' | 'clip-centre' | 'blur' | 'perspective' | 'scale' | 'mask';
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Tag data-reveal={variant} className={className} style={style}>
      {children}
    </Tag>
  );
}
