import type { CSSProperties, ReactNode } from 'react';
import '../css/folder.css';

type Props = { width: number; children: ReactNode };

export function FolderHead({ width, children }: Props) {
  return (
    <header className="folder-head" style={{ '--fh-w': `${width}px` } as CSSProperties}>
      <div className="fh-band">
        <div className="fh-in">{children}</div>
      </div>
    </header>
  );
}
