import React, { useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

export function TutorialDemo() {
  const [rate, setRate] = useState(0.15);
  const [position, setPosition] = useState(3);
  const [steps, setSteps] = useState(0);
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = -4 + i / 10;
    return `${i ? 'L' : 'M'}${200 + x * 43},${195 - x * x * 10}`;
  }).join(' ');

  return (
    <div className="exploration-demo-grid">
      <div>
        <p className="eyebrow">Demo tutorial / Optimization</p>
        <h3>Take a step downhill.</h3>
        <p>To minimize f(x) = x², move against its slope, 2x. Each step updates x to x − α · 2x, where α is the learning rate.</p>
        <label htmlFor="demo-learning-rate">Learning rate <output>{rate.toFixed(2)}</output></label>
        <input id="demo-learning-rate" type="range" min="0.05" max="0.9" step="0.05" value={rate} onChange={event => setRate(Number(event.target.value))} />
        <div className="demo-actions">
          <button className="button button-primary button-small" onClick={() => { setPosition(x => x * (1 - 2 * rate)); setSteps(n => n + 1); }}>Take a step</button>
          <button className="button button-outline button-small" onClick={() => { setPosition(3); setSteps(0); }}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
        </div>
        <p className="demo-readout" role="status" aria-label="Gradient descent progress">Step {steps} · x = {position.toFixed(3)} · loss = {(position * position).toFixed(3)}</p>
        <p className="demo-note">Try a rate above 0.5: the point crosses the minimum on each step.</p>
      </div>
      <svg className="demo-plot" viewBox="0 0 400 225" role="img" aria-label="Parabola showing the current gradient descent position">
        <path d="M22 195H378M200 20V205" stroke="#738361" strokeOpacity=".4" fill="none" />
        <path d={curve} stroke="var(--green)" strokeWidth="2" fill="none" />
        <path d={`M${200 + position * 43} ${195 - position * position * 10}V195`} stroke="#a6ba8a" strokeDasharray="4 4" />
        <circle cx={200 + position * 43} cy={195 - position * position * 10} r="6" fill="var(--green)" />
        <text x="207" y="215" fill="#a9afa0" fontSize="10">0 / minimum</text>
      </svg>
    </div>
  );
}

export function AnimationDemo() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  return (
    <div className="exploration-demo-grid">
      <div>
        <p className="eyebrow">Demo animation / Circular motion</p>
        <h3>A small orbit of ideas.</h3>
        <p>A point moving around a circle combines a cosine on the horizontal axis with a sine on the vertical axis. Adjust its speed and watch the motion.</p>
        <label htmlFor="demo-orbit-speed">Speed <output>{speed.toFixed(1)}×</output></label>
        <input id="demo-orbit-speed" type="range" min="0.5" max="3" step="0.5" value={speed} onChange={event => setSpeed(Number(event.target.value))} />
        <div className="demo-actions">
          <button className="button button-primary button-small" onClick={() => setPlaying(value => !value)} aria-pressed={playing}>
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{playing ? 'Pause orbit' : 'Play orbit'}
          </button>
        </div>
        <p className="demo-note">Motion starts only when you press play. Reduced-motion preferences keep the scene still.</p>
      </div>
      <svg className="demo-plot" viewBox="0 0 400 260" role="img" aria-label="Circular orbit with a moving point and radius">
        <circle cx="200" cy="130" r="92" stroke="#718660" strokeWidth="1" fill="none" />
        <circle cx="200" cy="130" r="58" stroke="#718660" strokeDasharray="3 7" strokeOpacity=".4" fill="none" />
        <path d="M83 130H317M200 13V247" stroke="#718660" strokeOpacity=".25" />
        <g className="demo-orbit" style={{ animationDuration: `${8 / speed}s`, animationPlayState: playing ? 'running' : 'paused' }}>
          <path d="M200 130H292" stroke="var(--green)" strokeOpacity=".6" />
          <circle cx="292" cy="130" r="7" fill="var(--green)" />
        </g>
        <circle cx="200" cy="130" r="4" fill="var(--green)" />
      </svg>
    </div>
  );
}

export function IdeaDemo() {
  return (
    <article className="exploration-reading">
      <p className="eyebrow">Demo idea / An open question</p>
      <h3>What if an agent had a memory budget?</h3>
      <p>Instead of saving every interaction, imagine giving an agent a fixed number of memory slots. It would have to choose what to retain, compress, or forget.</p>
      <h4>The hypothesis</h4>
      <p>A limited memory could encourage more selective context. This is an untested concept, rather than a claim about better performance.</p>
      <h4>A small experiment</h4>
      <p>Compare an agent that keeps everything with one that retains only a few summaries. Use the same tasks and compare task completion, context size, and mistakes caused by forgotten information.</p>
      <p className="demo-note">Open question: how do we preserve rare but useful details without keeping everything?</p>
    </article>
  );
}

export function BlogDemo() {
  return (
    <article className="exploration-reading">
      <p className="eyebrow">Demo blog / A short reflection</p>
      <h3>Why small experiments matter.</h3>
      <p>A useful experiment can start with one clear question. What changes if we vary a single parameter? What would convince us that an idea is wrong?</p>
      <h4>Make the question visible</h4>
      <p>A tiny visualization can turn a formula into something we can inspect. The gradient descent demo here does exactly that: one point, one curve, and one choice about the next step.</p>
      <h4>Keep room for surprise</h4>
      <p>The goal of an early experiment is to learn. Keep the setup small enough to understand, record what happens, and let the result shape the next question.</p>
      <p className="demo-note">Sample content created for this portfolio preview.</p>
    </article>
  );
}
