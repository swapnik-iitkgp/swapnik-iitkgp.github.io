import React, { useEffect, useRef, useState } from 'react';
import { FileText, GraduationCap, Mail } from 'lucide-react';
import { FaGithub, FaLinkedin, FaMedium } from 'react-icons/fa';
import FourierName from '../FourierName/FourierName';
import { profile } from '../../data/portfolio';
import './Home.css';

const Home = ({ hasScrolled }) => {
  const heroGrid = useRef(null);
  const [animationsPaused, setAnimationsPaused] = useState(() => !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const grid = heroGrid.current;
    const copy = grid.querySelector('.hero-copy');
    const art = grid.querySelector('.hero-art');
    const frame = grid.querySelector('.hero-portrait-frame');
    const photo = grid.querySelector('.hero-portrait');
    const caption = grid.querySelector('.hero-portrait-caption');
    const socials = grid.querySelector('.hero-socials');
    let scheduled = null;
    const fit = () => {
      if (window.innerWidth <= 900) {
        art.classList.remove('is-fitted');
        art.style.removeProperty('--hero-column-height');
        art.style.removeProperty('--hero-portrait-size');
        return;
      }
      const height = copy.getBoundingClientRect().height;
      const width = art.getBoundingClientRect().width;
      if (!height || !width || !photo.naturalWidth) return;
      const frameStyle = getComputedStyle(frame);
      const captionStyle = getComputedStyle(caption);
      const pixels = (style, name) => parseFloat(style[name]) || 0;
      const horizontalFrame = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((sum, name) => sum + pixels(frameStyle, name), 0);
      const verticalFrame = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((sum, name) => sum + pixels(frameStyle, name), 0);
      const remaining = height - caption.getBoundingClientRect().height - pixels(captionStyle, 'marginTop') - socials.getBoundingClientRect().height - pixels(getComputedStyle(art), 'rowGap');
      const size = Math.min(width, Math.max(0, remaining - verticalFrame) * photo.naturalWidth / photo.naturalHeight + horizontalFrame);
      art.style.setProperty('--hero-column-height', `${height}px`);
      art.style.setProperty('--hero-portrait-size', `${Math.floor(size)}px`);
      art.classList.add('is-fitted');
    };
    const schedule = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(fit);
    };
    const observer = window.ResizeObserver ? new ResizeObserver(schedule) : null;
    [copy, art, caption, socials].forEach(element => observer?.observe(element));
    photo.addEventListener('load', schedule);
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(scheduled);
      observer?.disconnect();
      photo.removeEventListener('load', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleChange = event => {
      if (event.matches) setAnimationsPaused(true);
    };
    preference?.addEventListener('change', handleChange);
    return () => preference?.removeEventListener('change', handleChange);
  }, []);

  return (
    <section id="home" className="hero hero-reimagined" aria-labelledby="hero-heading">
      <div className="container hero-container">
        <div className="hero-grid" ref={heroGrid}>
          <div className="hero-copy">
            <FourierName headingId="hero-heading" paused={animationsPaused} />
            <p className="hero-lead">
              I am a <a href="https://www.microsoft.com/en-us/research/people/t-nvarala/" target="_blank" rel="noopener noreferrer"><strong>Research Fellow</strong></a> at{' '}
              <strong>Microsoft India (R&amp;D) Pvt Ltd</strong>, based in Bengaluru, India. <span className="hero-keep-together">I work</span> with the{' '}
              <a href="https://www.microsoft.com/en-us/research/group/prose/" target="_blank" rel="noopener noreferrer"><strong>PROSE team</strong></a> on AI research for{' '}
              <strong>Excel Copilot</strong>, focusing on the evaluation and reliability of intelligent agents.
            </p>
            <div className="hero-bio">
            <p className="hero-description">
              Previously, I was a Research Engineer at{' '}
              <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-india/" target="_blank" rel="noopener noreferrer"><strong>Microsoft Research India</strong></a>, working on{' '}
              <a href="https://github.com/microsoft/Agentic-Shiksha/" target="_blank" rel="noopener noreferrer"><strong>Agentic Shiksha</strong></a>, an Agentic AI powered educational platform twinned with{' '}
              <a href="https://medium.com/@swamimanohar_73269/project-ekalaiva-the-six-pillars-of-educational-transformation-9e7c022b2964" target="_blank" rel="noopener noreferrer"><strong>Project EKALAIVA</strong></a>, under the mentorship of{' '}
              <a href="https://www.microsoft.com/en-us/research/people/swmanohmicrosoft-com/" target="_blank" rel="noopener noreferrer"><strong>Manohar Swaminathan</strong></a>.
            </p>
            <p className="hero-description">
              My research spans <strong>federated learning, machine unlearning, multimodal AI, NLP, and 2D &amp; 3D computer vision</strong>, with experience at{' '}
              <strong>Sarvam AI, NTU Singapore, and IIT Hyderabad</strong>, and publications in <strong>federated learning</strong> at{' '}
              <strong>IEEE INFOCOM 2025</strong> and <strong>AAAI 2025</strong> workshops.
            </p>
            <p className="hero-description">
              I graduated from <strong>IIT Kharagpur in 2025</strong> with a B.Tech. (Honours) in Metallurgical &amp; Materials Engineering and a minor in Computer Science &amp; Engineering.
            </p>
            </div>
            <div className="hero-side-notes">
              <div className="hero-note">
                <h2 className="hero-note-label">Research interests</h2>
                <div className="hero-interest-group hero-interest-unified">
                  <ul className="hero-interest-topics" aria-label="Research interests" tabIndex={0}>
                    <li>Reinforcement learning</li>
                    <li>Multimodal learning</li>
                    <li>Agentic systems</li>
                    <li>Optimization</li>
                    <li>Robot learning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <figure className="hero-portrait-figure" aria-labelledby="hero-portrait-caption">
              <div className="hero-portrait-frame">
                <img className="hero-portrait" src={profile.portrait} alt={`Illustrated portrait of ${profile.name}`} width="800" height="800" />
              </div>
              <figcaption id="hero-portrait-caption" className="hero-portrait-caption">
                <span className="hero-portrait-name">{profile.name}</span>
                <img className="hero-employer-logo" src={`${process.env.PUBLIC_URL}/media/logos/microsoft.svg`} alt="Microsoft" width="126" height="28" />
              </figcaption>
            </figure>
            <div className="hero-socials" role="group" aria-label="Contact and profile links">
              <a className="button" href={`mailto:${profile.email}`}><Mail size={18} aria-hidden="true" /> Email</a>
              <a className="button" href={profile.resume} target="_blank" rel="noopener noreferrer"><FileText size={18} aria-hidden="true" /> Resume</a>
              <a className="button" href={profile.scholar} target="_blank" rel="noopener noreferrer"><GraduationCap size={18} aria-hidden="true" /> Google Scholar</a>
              <a className="button" href={profile.github} target="_blank" rel="noopener noreferrer"><FaGithub size={18} aria-hidden="true" /> GitHub</a>
              <a className="button" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin size={18} aria-hidden="true" /> LinkedIn</a>
              <a className="button" href={profile.medium} target="_blank" rel="noopener noreferrer"><FaMedium size={18} aria-hidden="true" /> Medium</a>
            </div>
          </div>
        </div>
        <a
          className={`hero-scroll-cue${hasScrolled ? ' is-hidden' : ''}`}
          href="#research"
          aria-label="Scroll down to Research"
          aria-hidden={hasScrolled || undefined}
          tabIndex={hasScrolled ? -1 : undefined}
        >
          <svg width="64" height="44" viewBox="0 0 72 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13 L33 24 Q36 26 39 24 L62 13" />
            <path d="M10 24 L33 35 Q36 37 39 35 L62 24" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default Home;
