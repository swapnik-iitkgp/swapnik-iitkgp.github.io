import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { verifyCountdown } from './verifyCountdown';

export function ResearchField({ paused, onToggle }) {
  const canvas = useRef(null);
  const [available, setAvailable] = useState(true);
  const pausedRef = useRef(paused);
  const synchronizeRef = useRef(null);

  useEffect(() => {
    pausedRef.current = paused;
    synchronizeRef.current?.();
  }, [paused]);

  useEffect(() => {
    const element = canvas.current;
    const context = element.getContext('2d');
    if (!context) {
      setAvailable(false);
      return undefined;
    }

    let frame = null;
    let width = 0;
    let height = 0;
    let time = 0;
    let last = 0;
    let visible = true;
    const pointer = { x: 0, y: 0 };
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const points = [];
    for (let i = 0; i < 68; i++) {
      const u = i / 68 * Math.PI * 2;
      for (let j = 0; j < 30; j++) {
        const v = j / 30 * Math.PI * 2;
        const radius = 0.4 + 0.055 * Math.cos(3 * u);
        points.push([(1 + radius * Math.cos(v)) * Math.cos(u), (1 + radius * Math.cos(v)) * Math.sin(u), radius * Math.sin(v) + 0.15 * Math.sin(2 * u)]);
      }
    }

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.29;
      const ax = 1.02 + pointer.y * 0.1;
      const az = -0.52 + pointer.x * 0.13;
      const ay = time * 0.11;
      const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
      const projected = points.map(([a, b, c]) => {
        const x = a * cy + c * sy;
        const depth = c * cy - a * sy;
        const y = b * cx - depth * sx;
        const z = b * sx + depth * cx;
        return [width / 2 + (x * cz - y * sz) * scale, height / 2 + (x * sz + y * cz) * scale, z];
      });

      context.lineWidth = 0.6;
      projected.forEach(([x, y, z], index) => {
        const next = projected[Math.floor(index / 30) * 30 + (index + 1) % 30];
        const shade = (z + 1.5) / 3;
        context.strokeStyle = `rgba(182,194,154,${0.035 + shade * 0.15})`;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(next[0], next[1]);
        context.stroke();
        if (index % 3 === 0) {
          const other = projected[(index + 30) % projected.length];
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(other[0], other[1]);
          context.stroke();
        }
        context.fillStyle = index % 11 === 0 ? `rgba(211,237,155,${0.4 + shade * 0.5})` : `rgba(199,203,180,${0.16 + shade * 0.6})`;
        context.beginPath();
        context.arc(x, y, index % 11 === 0 ? 1.4 : 0.7, 0, Math.PI * 2);
        context.fill();
      });
      context.strokeStyle = '#d2e6a327';
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(width / 2, height / 2, scale * 1.7, scale * 0.7, -0.4, 0, Math.PI * 2);
      context.stroke();
      const angle = time * 0.15 + 2.5;
      const ox = Math.cos(angle) * scale * 1.7;
      const oy = Math.sin(angle) * scale * 0.7;
      context.fillStyle = '#d2e6a3';
      context.beginPath();
      context.arc(width / 2 + ox * Math.cos(-0.4) - oy * Math.sin(-0.4), height / 2 + ox * Math.sin(-0.4) + oy * Math.cos(-0.4), 3, 0, Math.PI * 2);
      context.fill();
    };

    const shouldAnimate = () => !pausedRef.current && visible && !document.hidden;
    const tick = now => {
      frame = null;
      if (!shouldAnimate()) return;
      if (now - last >= 1000 / 24) {
        time += Math.min((now - last) / 1000, 0.08);
        last = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      if (shouldAnimate() && frame === null) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!shouldAnimate() && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    };
    synchronizeRef.current = synchronize;

    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = width * ratio;
      element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    const move = event => {
      if (pausedRef.current || preference?.matches) return;
      const bounds = element.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    const intersectionObserver = window.IntersectionObserver ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    }) : null;
    resizeObserver?.observe(element);
    intersectionObserver?.observe(element);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', synchronize);
    element.addEventListener('pointermove', move);
    resize();
    synchronize();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      synchronizeRef.current = null;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', synchronize);
      element.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <div className="research-field">
      <div className="field-top"><span>LEARNING IS A LOOP.</span><button type="button" onClick={onToggle} aria-label={paused ? 'Play hero animations' : 'Pause hero animations'} title="Pause or play both the name and research animations" aria-pressed={!paused}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button></div>
      {available ? <canvas ref={canvas} role="img" aria-label="Illustrative sculptural network of connected points" /> : <div className="field-fallback"><ProjectVisual type="agents" /><p>Animation unavailable. Showing a static system overview.</p></div>}
      <span className="field-word field-learn" aria-hidden="true">learn</span><span className="field-word field-reason" aria-hidden="true">reason</span><span className="field-word field-act" aria-hidden="true">act</span>
      <span className="field-cross cross-one" aria-hidden="true">+</span><span className="field-cross cross-two" aria-hidden="true">+</span>
    </div>
  );
}

export function ProjectVisual({ type }) {
  if (type === 'agents') return (
    <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#8fae84"><path d="M180 90H260Q280 90 280 115V145M460 90H380Q360 90 360 115V145M180 220H260Q280 220 280 195V170M460 220H380Q360 220 360 195V170" /><path d="M320 55V128m0 46v75" strokeDasharray="4 6" /></g>
      <g fill="#17251e" stroke="#667d60"><rect x="65" y="66" width="135" height="48" rx="5" /><rect x="440" y="66" width="135" height="48" rx="5" /><rect x="65" y="196" width="135" height="48" rx="5" /><rect x="440" y="196" width="135" height="48" rx="5" /><rect x="242" y="128" width="156" height="54" rx="6" fill="#d5e4ad" stroke="none" /></g>
      <g textAnchor="middle" fontSize="13" fontFamily="monospace" fill="#bdcbb5"><text x="132" y="95">Teacher insight</text><text x="508" y="95">Lumen agent</text><text x="132" y="225">Memory</text><text x="508" y="225">Learning state</text><text x="320" y="160" fill="#243321" fontWeight="bold">Agentic Shiksha</text><text x="320" y="46" fontSize="10" letterSpacing="2">TEACH / LEARN / REFLECT</text><text x="320" y="274" fontSize="9" letterSpacing="2">CONCEPTUAL SYSTEM OVERVIEW</text></g>
      <g fill="#d5e4ad"><circle cx="230" cy="90" r="3" /><circle cx="408" cy="220" r="3" /><circle cx="320" cy="205" r="3" /></g>
    </svg>
  );
  if (type === 'reasoning') return (
    <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false">
      <g stroke="#72553f" fill="none"><path d="M50 246H590M50 60V246" strokeDasharray="2 6" /><rect x="138" y="69" width="68" height="70" rx="6" /><rect x="286" y="69" width="68" height="70" rx="6" /><rect x="434" y="69" width="68" height="70" rx="6" /><path d="M172 139V166H320m148-27v27H320v22" /></g>
      <g fontFamily="monospace" textAnchor="middle"><g fill="#e9bd98" fontSize="37"><text x="172" y="117">7</text><text x="320" y="117">3</text><text x="468" y="117">6</text></g><text x="320" y="221" fill="#f2d5bd" fontSize="28">(7 - 3) &times; 6 = 24</text><text x="320" y="273" fill="#c6a68c" fontSize="10" letterSpacing="2">REASON / VERIFY / LEARN</text></g>
      <circle cx="553" cy="216" r="13" fill="#33402b" /><path d="m547 216 4 4 8-9" stroke="#c9dca1" fill="none" strokeWidth="1.5" />
    </svg>
  );
  if (type === 'ocr') return (
    <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false">
      <g transform="translate(118,32) rotate(-7 80 120)"><rect width="162" height="228" rx="3" fill="#cab79a" /><rect x="20" y="23" width="80" height="8" fill="#746249" />{Array.from({ length: 15 }, (_, i) => <g key={i} opacity={0.25 + i % 3 * 0.1}><rect x="20" y={46 + i * 10} width={52 + i % 3 * 4} height="3" fill="#554837" /><rect x="87" y={46 + i * 10} width={48 + i % 4 * 3} height="3" fill="#554837" /></g>)}<rect x="15" y="40" width="63" height="160" fill="none" stroke="#554837" strokeDasharray="3 4" /><rect x="83" y="40" width="63" height="160" fill="none" stroke="#554837" strokeDasharray="3 4" /></g>
      <path d="M308 150h40m-7-7 7 7-7 7" stroke="#bbaa91" fill="none" /><g transform="translate(379,48)"><rect width="150" height="204" rx="4" fill="#272721" stroke="#626450" /><text x="18" y="34" fontFamily="monospace" fontSize="12" fill="#d1dda7">&lt;document&gt;</text>{Array.from({ length: 10 }, (_, i) => <rect key={i} x="18" y={54 + i * 10} width={60 + (i * 19) % 48} height="3" rx="1" fill={i % 4 === 0 ? '#b7c695' : '#646c55'} />)}<text x="18" y="182" fontFamily="monospace" fontSize="12" fill="#d1dda7">&lt;/document&gt;</text></g>
      <text x="320" y="283" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#c0bba9" letterSpacing="2">PAGE / STRUCTURE / TEXT</text>
    </svg>
  );
  if (type === 'spatial') {
    const dots = [];
    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 20; y++) {
        const z = x > 6 && x < 15 && y > 4 && y < 14 ? 9 : x > 19 && x < 26 && y > 9 ? 6 : 0;
        const px = 315 + (x - y) * 9;
        const py = 130 + (x + y) * 3.2 - z * 7;
        dots.push(<circle key={`${x}-${y}`} cx={px} cy={py} r={z ? 1.9 : 1.2} fill={z === 9 ? '#a9c9c2' : z === 6 ? '#b3bf83' : '#426e73'} />);
        if (z) for (let h = 0; h < z; h += 2) dots.push(<circle key={`${x}-${y}-${h}`} cx={px} cy={py + h * 7} r=".8" fill="#72a49a" opacity=".65" />);
      }
    }
    return <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false"><g stroke="#3b5e61" fill="none" opacity=".6"><path d="M90 245 320 300 590 190M320 300V265M90 245V220" /></g>{dots}<text x="65" y="80" fill="#92b8b0" fontFamily="monospace" fontSize="12">x, y, z &rarr; semantics</text><text x="320" y="283" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#adc9c3" letterSpacing="2">PROCEDURAL POINT-CLOUD STUDY</text></svg>;
  }
  if (type === 'marl') return <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false"><g stroke="#4e5268" fill="none">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${130 + i * 50} 55v190M130 ${55 + i * 27}h350`} />)}</g><path d="M155 220V140h150v-55h150" fill="none" stroke="#c0c9ed" strokeWidth="2" /><path d="M455 220h-100v-54h-100v-80" fill="none" stroke="#c0d9a4" strokeWidth="2" strokeDasharray="5 4" /><circle cx="155" cy="220" r="9" fill="#c0c9ed" /><circle cx="455" cy="220" r="9" fill="#c0d9a4" /><text x="320" y="280" textAnchor="middle" fill="#b9bfd2" fontSize="10" fontFamily="monospace" letterSpacing="2">SHARED ENVIRONMENT / DIFFERENT POLICIES</text></svg>;
  if (type === 'erasure') return <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false"><g fill="none" stroke="#667575">{Array.from({ length: 18 }, (_, i) => <path key={i} d={`M90 ${50 + i * 11}Q260 ${180 - i * 7} 320 150T550 ${60 + i * 10}`} opacity={i > 5 && i < 12 ? 0.15 : 0.65} />)}</g><path d="M320 40v220" stroke="#d5d9c4" strokeDasharray="3 5" /><rect x="283" y="121" width="74" height="58" fill="#d2d8c3" /><text x="320" y="158" textAnchor="middle" fill="#27332d" fontSize="24" fontFamily="serif">P&#8869;</text><text x="320" y="283" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#c2cbbd" letterSpacing="2">REPRESENTATION / CONCEPT PROJECTION</text></svg>;
  if (type === 'language') return <svg className="project-svg" viewBox="0 0 640 300" aria-hidden="true" focusable="false"><g fill="none" stroke="#7b7193"><path d="M170 100H270V150M170 200H270V150H370M470 150H540" /><rect x="70" y="78" width="100" height="44" rx="4" /><rect x="70" y="178" width="100" height="44" rx="4" /><rect x="370" y="120" width="100" height="60" rx="4" /></g><g fill="#d4c9e8" fontFamily="monospace" fontSize="13" textAnchor="middle"><text x="120" y="105">Language</text><text x="120" y="205">Context</text><text x="420" y="154">Flan-T5</text><text x="320" y="262" fontSize="10" letterSpacing="2">REPRESENT / ADAPT / CLASSIFY</text></g></svg>;
  return <p className="visual-unavailable">Project illustration unavailable.</p>;
}

export function CountdownLab() {
  const [expression, setExpression] = useState('(7 - 3) * 6');
  const [result, setResult] = useState(null);
  return (
    <section className="countdown-lab" aria-labelledby="countdown-heading">
      <p className="eyebrow">TRY A VERIFIABLE REWARD</p>
      <h3 id="countdown-heading">Three numbers. One target.</h3>
      <p>Use <strong>7, 3, and 6</strong> exactly once to make <strong>24</strong>. Allowed: +, &minus;, &times;, &divide;, and parentheses.</p>
      <form onSubmit={event => { event.preventDefault(); setResult(verifyCountdown(expression)); }}>
        <label htmlFor="countdown-expression">Your expression</label>
        <div className="expression-row"><input id="countdown-expression" maxLength={100} value={expression} onChange={event => { setExpression(event.target.value); setResult(null); }} autoComplete="off" spellCheck={false} aria-describedby="countdown-feedback countdown-note" /><button className="button button-primary" type="submit">Verify &rarr;</button></div>
      </form>
      <p id="countdown-feedback" className={`verify-result${result?.valid ? ' valid' : ''}`} role="status">{result ? result.message : 'Change the expression and test the constraints.'}</p>
      <small id="countdown-note">Rule-based illustration. No language model runs in this demo.</small>
    </section>
  );
}
