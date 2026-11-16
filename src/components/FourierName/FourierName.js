import React, { useEffect, useRef, useState } from 'react';
import data from '../../data/fourier-name.json';
import { createFourierGeometry, extendLetterTrace, getFourierFrame, getFourierTip } from './fourier';

const { bounds, drawingBounds, letters, nameWidthRatio } = createFourierGeometry(data);
const SPEED = 4;
const DRAW_SECONDS = data.drawSeconds / SPEED;
const FILL_SECONDS = data.fillSeconds / SPEED;
const DURATION = DRAW_SECONDS + FILL_SECONDS + data.holdSeconds / SPEED;
const TAU = Math.PI * 2;
const viewBox = `${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`;

export default function FourierName({ headingId, paused }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);
  const engineRef = useRef(null);
  const [state, setState] = useState('initial');

  useEffect(() => {
    pausedRef.current = paused;
    engineRef.current?.synchronize();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const trail = document.createElement('canvas');
    const trailContext = trail.getContext('2d');
    if (!context || !trailContext || !window.Path2D) {
      setState('unavailable');
      return undefined;
    }

    const styles = getComputedStyle(canvas);
    const nameColor = styles.color;
    const orbitColor = styles.getPropertyValue('--muted').trim();
    const tipColor = styles.getPropertyValue('--ink').trim();
    const word = new Path2D(letters.map(letter => letter.path).join(' '));
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let elapsed = pausedRef.current ? DURATION : 0;
    let frame = null;
    let last = 0;
    let visible = true;
    let scale = 1;
    let pixelRatio = 1;
    let drawn = 0;

    const clear = (surface, painter) => {
      painter.save();
      painter.setTransform(1, 0, 0, 1, 0, 0);
      painter.clearRect(0, 0, surface.width, surface.height);
      painter.restore();
    };
    const clearTrail = () => {
      clear(trail, trailContext);
      drawn = 0;
    };
    const draw = () => {
      clear(canvas, context);
      if (elapsed === 0) return;

      const { target, phase, fill } = getFourierFrame(elapsed, DRAW_SECONDS, FILL_SECONDS, data.n);
      if (target < drawn) clearTrail();
      if (target > drawn) {
        trailContext.strokeStyle = nameColor;
        trailContext.lineWidth = 2.2 / scale;
        trailContext.lineCap = 'round';
        trailContext.lineJoin = 'round';
        letters.forEach(letter => extendLetterTrace(trailContext, letter, drawn, target));
        drawn = target;
      }

      const vectorsOpacity = Math.max(0, 1 - Math.max(0, elapsed - DRAW_SECONDS) / 0.4) * (1 - fill);
      if (vectorsOpacity > 0) {
        context.save();
        context.globalAlpha = 0.35 * vectorsOpacity;
        for (const letter of letters) {
          let x = letter.center[0] + letter.offset[0];
          let y = letter.center[1] + letter.offset[1];
          for (const [frequency, re, im] of letter.coefficients) {
            const angle = TAU * frequency * phase;
            const cosine = Math.cos(angle);
            const sine = Math.sin(angle);
            const dx = re * cosine - im * sine;
            const dy = re * sine + im * cosine;
            const radius = Math.hypot(dx, dy);
            if (radius * scale > 1.8) {
              context.beginPath();
              context.arc(x, y, radius, 0, TAU);
              context.lineWidth = 0.9 / scale;
              context.strokeStyle = orbitColor;
              context.stroke();
            }
            if (radius * scale > 0.8) {
              context.beginPath();
              context.moveTo(x, y);
              context.lineTo(x + dx, y + dy);
              context.lineWidth = 1 / scale;
              context.strokeStyle = nameColor;
              context.stroke();
            }
            x += dx;
            y += dy;
          }
        }
        context.restore();
      }

      // Only paint the path already drawn; there is no complete guide underneath it.
      context.save();
      context.globalAlpha = 1 - fill;
      context.drawImage(trail, drawingBounds.left, drawingBounds.top, drawingBounds.width, drawingBounds.height);
      context.restore();
      if (fill > 0) {
        context.save();
        context.globalAlpha = fill;
        context.fillStyle = nameColor;
        context.fill(word, 'nonzero');
        context.restore();
      }

      context.save();
      context.globalAlpha = vectorsOpacity;
      letters.forEach(letter => {
        if (vectorsOpacity === 0) return;
        const tip = getFourierTip(letter, phase);
        if (!tip) return;
        context.save();
        context.fillStyle = tipColor;
        context.shadowColor = nameColor;
        context.shadowBlur = 6 * pixelRatio;
        context.beginPath();
        context.arc(tip.x, tip.y, 1.8 / scale, 0, TAU);
        context.fill();
        context.restore();
      });
      context.restore();
    };

    const shouldAnimate = () => !pausedRef.current && visible && !document.hidden;
    const tick = timestamp => {
      frame = null;
      if (!shouldAnimate()) return;
      if (timestamp - last >= 1000 / 30) {
        elapsed += (timestamp - last) / 1000;
        last = timestamp;
        if (elapsed >= DURATION) {
          elapsed = 0;
          clearTrail();
        }
        draw();
      }
      if (shouldAnimate()) frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      if (shouldAnimate() && frame === null) {
        if (elapsed >= DURATION) {
          elapsed = 0;
          clearTrail();
          draw();
        }
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!shouldAnimate() && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    };
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      scale = Math.min(box.width / drawingBounds.width, box.height / drawingBounds.height);
      canvas.width = trail.width = Math.round(box.width * pixelRatio);
      canvas.height = trail.height = Math.round(box.height * pixelRatio);
      for (const painter of [context, trailContext]) {
        painter.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, -drawingBounds.left * scale * pixelRatio, -drawingBounds.top * scale * pixelRatio);
      }
      drawn = 0;
      draw();
    };
    const preferenceChanged = event => {
      if (!event.matches) return;
      pausedRef.current = true;
      elapsed = DURATION;
      draw();
      synchronize();
    };

    engineRef.current = { synchronize };
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    const intersectionObserver = window.IntersectionObserver ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    }) : null;
    resizeObserver?.observe(canvas);
    intersectionObserver?.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', synchronize);
    preference?.addEventListener('change', preferenceChanged);
    resize();
    setState('ready');
    synchronize();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      engineRef.current = null;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', synchronize);
      preference?.removeEventListener('change', preferenceChanged);
    };
  }, []);

  return (
    <div className="hero-name-intro">
      <h1
        id={headingId}
        className="hero-name-heading"
        style={{
          '--fourier-name-ratio': nameWidthRatio,
          '--fourier-width-ratio': drawingBounds.width / bounds.width,
          '--fourier-left-ratio': (bounds.left - drawingBounds.left) / bounds.width,
          '--fourier-height-ratio': drawingBounds.height / bounds.height,
          '--fourier-top-ratio': (bounds.top - drawingBounds.top) / bounds.height,
        }}
      >
        <span className="hero-intro-label">My name is</span>{' '}
        <span className="sr-only">SWAPNIK</span>
        <span className={`fourier-stage${state === 'ready' ? ' is-ready' : ''}`} style={{ aspectRatio: `${bounds.width} / ${bounds.height}` }} aria-hidden="true">
          {(state === 'unavailable' || (state === 'initial' && paused)) && <svg className="fourier-static" viewBox={viewBox} preserveAspectRatio="xMinYMid meet" focusable="false">
            {letters.map(letter => <path key={letter.letter} d={letter.path} fill="currentColor" fillRule="nonzero" />)}
          </svg>}
          <canvas ref={canvasRef} />
        </span>
      </h1>
      {state === 'unavailable' && <p className="fourier-status" role="status">Name animation unavailable. Showing the static name.</p>}
    </div>
  );
}
