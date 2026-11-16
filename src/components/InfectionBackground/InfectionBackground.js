import React, { useEffect, useRef, useState } from 'react';
import { createDiffusionField } from './diffusion';

const LIFETIME = 4500;
const FRAME_INTERVAL = 1000 / 24;
const CONTROLS = [
  'a, button, input, textarea, select, label, summary, header, nav, dialog',
  '[role="dialog"], [role="button"], [role="link"], [role="tab"], [role="menuitem"]',
  '[role="switch"], [role="checkbox"], [role="radio"], [role="slider"]',
  '[contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])',
].join(', ');

export default function InfectionBackground() {
  const canvasRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let context = null;
    let field = null;
    let image = null;
    let bounds = null;
    let frame = null;
    let active = false;
    let failed = false;
    let lastFrame = 0;
    let lastInput = 0;

    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      active = false;
      field?.clear();
      context?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const resize = () => {
      if (!context) return;
      reset();
      bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        failed = true;
        setUnavailable(true);
        return;
      }
      const resolution = Math.max(6, Math.sqrt(bounds.width * bounds.height / 30000), bounds.width / 256, bounds.height / 256);
      canvas.width = Math.max(2, Math.floor(bounds.width / resolution));
      canvas.height = Math.max(2, Math.floor(bounds.height / resolution));
      field = createDiffusionField(canvas.width, canvas.height);
      image = context.createImageData(canvas.width, canvas.height);
      failed = false;
      setUnavailable(false);
    };

    const paint = fade => {
      field.paint(image.data, fade);
      context.putImageData(image, 0, 0);
    };

    const tick = now => {
      frame = null;
      if (document.hidden || preference?.matches || now - lastInput >= LIFETIME) {
        reset();
        return;
      }
      if (now - lastFrame >= FRAME_INTERVAL) {
        const peak = field.step(Math.min((now - lastFrame) / 1000, 0.1));
        lastFrame = now;
        if (peak < 0.0005) {
          reset();
          return;
        }
        paint(Math.min(1, (LIFETIME - (now - lastInput)) / 1000));
      }
      frame = requestAnimationFrame(tick);
    };

    const click = event => {
      const target = event.target;
      if (
        failed || preference?.matches || event.button !== 0 || event.detail < 1 ||
        event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
        !(target instanceof Element) || target.closest(CONTROLS) ||
        document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]') ||
        window.getSelection?.()?.isCollapsed === false
      ) return;

      if (!context) {
        context = canvas.getContext('2d');
        if (!context) {
          failed = true;
          setUnavailable(true);
          return;
        }
        resize();
        if (failed) return;
      }

      const now = performance.now();
      field.inject(
        (event.clientX - bounds.left) * canvas.width / bounds.width,
        (event.clientY - bounds.top) * canvas.height / bounds.height,
      );
      lastInput = now;
      if (!active) lastFrame = now;
      active = true;
      paint(1);
      if (frame === null && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const motionChanged = event => {
      if (event.matches) reset();
    };
    document.addEventListener('click', click, { passive: true });
    document.addEventListener('visibilitychange', reset);
    window.addEventListener('resize', resize);
    preference?.addEventListener('change', motionChanged);

    return () => {
      reset();
      document.removeEventListener('click', click);
      document.removeEventListener('visibilitychange', reset);
      window.removeEventListener('resize', resize);
      preference?.removeEventListener('change', motionChanged);
    };
  }, []);

  return (
    <>
      <canvas className="infection-background" ref={canvasRef} aria-hidden="true" />
      {unavailable && <p className="infection-status" role="status">Background animation unavailable in this browser.</p>}
    </>
  );
}
