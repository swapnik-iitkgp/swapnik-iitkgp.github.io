import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, Lightbulb, Orbit, PenLine, X } from 'lucide-react';
import { AnimationDemo, BlogDemo, IdeaDemo, TutorialDemo } from './Demos';

const categories = [
  { title: 'Tutorials', icon: BookOpen, description: 'Gradient descent, one step at a time.', action: 'Try the tutorial', demo: TutorialDemo },
  { title: 'Ideas', icon: Lightbulb, description: 'What if an agent had a memory budget?', action: 'Explore the idea', demo: IdeaDemo },
  { title: 'Animations', icon: Orbit, description: 'Circular motion, made interactive.', action: 'Open the animation', demo: AnimationDemo },
  { title: 'Blogs', icon: PenLine, description: 'A short reflection on small experiments.', action: 'Read the demo post', demo: BlogDemo },
];

const Explorations = () => {
  const [active, setActive] = useState(null);
  const panel = useRef(null);
  const Demo = active === null ? null : categories[active].demo;
  useEffect(() => {
    if (active !== null) panel.current?.focus();
  }, [active]);
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Explorations | Swapnik Varala';
    return () => { document.title = originalTitle; };
  }, []);

  const closeDemo = () => {
    document.getElementById(`exploration-open-${active}`)?.focus();
    setActive(null);
  };

  return (
  <section id="explorations" className="section explorations-section" aria-labelledby="explorations-heading">
    <div className="container">
      <a href="/#home" className="text-link exploration-back"><ArrowLeft size={15} aria-hidden="true" /> Back to portfolio</a>
      <div className="section-heading">
        <div><p className="eyebrow">EXPLORATIONS</p><h1 id="explorations-heading">A space for curiosity.</h1></div>
        <p className="section-description">Tutorials, ideas, animations, and writing. Things I learn, build, and explore along the way.</p>
      </div>
      <ul className="exploration-grid" aria-label="Exploration topics">
        {categories.map(({ title, icon: Icon, description, action }, index) => (
          <li className="exploration-card" key={title}>
            <div className="exploration-card-top">
              <Icon size={25} strokeWidth={1.3} aria-hidden="true" />
              <span>DEMO / 0{index + 1}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button id={`exploration-open-${index}`} className="text-link exploration-open" type="button" aria-expanded={active === index} aria-controls={active === index ? 'exploration-demo' : undefined} onClick={() => active === index ? closeDemo() : setActive(index)}>{action}<ArrowUpRight size={15} aria-hidden="true" /></button>
          </li>
        ))}
      </ul>
      {Demo && <div id="exploration-demo" className="exploration-demo" role="region" aria-label={`${categories[active].title} demo`} tabIndex={-1} ref={panel}>
        <div className="exploration-demo-toolbar"><span className="tiny-label">Exploration / Demo</span><button className="close-button" type="button" aria-label="Close exploration" onClick={closeDemo}><X size={18} aria-hidden="true" /></button></div>
        <Demo />
      </div>}
      <div className="exploration-status">
        <p><span className="status-dot" aria-hidden="true" /> Four demos to explore <span className="exploration-status-detail">Sample content. More explorations to come.</span></p>
      </div>
    </div>
  </section>
  );
};

export default Explorations;
