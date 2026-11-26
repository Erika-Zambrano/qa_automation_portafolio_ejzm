import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import '../css/cabinet.css';

export type CabinetChip = { to: string; label: string; tone: string; x: string; xm: string; y: string };
type Props = { passed: number; total: number; chips: CabinetChip[]; alt: string; label: string };

export function CabinetStage({ passed, total, chips, alt, label }: Props) {
  const { withLang } = useLang();
  const stageRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(passed);
      return;
    }
    let raf = 0;
    const start = performance.now() + 700;
    const tick = (now: number) => {
      const t0 = Math.min(Math.max((now - start) / 1500, 0), 1);
      setShown(Math.round(passed * (1 - Math.pow(1 - t0, 3))));
      if (t0 < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [passed]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return;
    let raf = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const px = Math.max(-1, Math.min(1, (event.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const py = Math.max(-1, Math.min(1, (event.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        stage.style.setProperty('--px', px.toFixed(3));
        stage.style.setProperty('--py', py.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="hero-art">
      <div className="stage" ref={stageRef}>
        <img className="stage-img" src="/hero-archivero.webp" alt={alt} width="760" height="1016" />
        <div className="screen" aria-hidden="true">
          <span className="screen-text">
            <span className="screen-num">{shown}/{total}</span>
            <span className="screen-unit">{shown >= passed ? '✓ PASS' : 'tests'}</span>
          </span>
        </div>
        <nav className="chips" aria-label={label}>
          {chips.map((c, i) => (
            <Link key={c.to + c.label} to={withLang(c.to)} className={`chip tone-${c.tone}`} style={{ '--x': c.x, '--xm': c.xm, '--y': c.y, '--i': i } as CSSProperties}>
              <span className="chip-in">{c.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
