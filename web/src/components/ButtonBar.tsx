import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '../css/buttons.css';

type Primary = { label: string; to: string } | { label: string; href: string };
type Props = { primary: Primary; variant?: 'hero' | 'close'; className?: string; children?: ReactNode };

export function ButtonBar({ primary, variant = 'hero', className, children }: Props) {
  const base = variant === 'close' ? 'close-row' : 'cta-row';
  const button =
    'to' in primary ? (
      <Link className="btn-primary" to={primary.to}>{primary.label}</Link>
    ) : (
      <a className="btn-primary" href={primary.href} {...(primary.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{primary.label}</a>
    );
  return <div className={[base, className].filter(Boolean).join(' ')}>{button}{children}</div>;
}
