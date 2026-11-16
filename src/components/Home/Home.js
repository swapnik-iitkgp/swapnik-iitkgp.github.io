import React, { useEffect, useState } from 'react';
import { ArrowDown, FileText, Github, GraduationCap, Linkedin, Mail } from 'lucide-react';
import { ResearchField } from '../../researchVisuals';
import FourierName from '../FourierName/FourierName';
import { profile } from '../../data/portfolio';

const Home = () => {
  const [animationsPaused, setAnimationsPaused] = useState(() => !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleChange = event => {
      if (event.matches) setAnimationsPaused(true);
    };
    preference?.addEventListener('change', handleChange);
    return () => preference?.removeEventListener('change', handleChange);
  }, []);

  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <FourierName headingId="hero-heading" paused={animationsPaused} />
            <p className="hero-lead">
              I am a <a href="https://www.microsoft.com/en-us/research/people/t-nvarala/" target="_blank" rel="noopener noreferrer"><strong>Research Fellow</strong></a> at{' '}
              <strong>Microsoft India (R&amp;D) Pvt Ltd</strong>, based in Bengaluru, India. I work with the{' '}
              <a href="https://www.microsoft.com/en-us/research/group/prose/" target="_blank" rel="noopener noreferrer"><strong>PROSE team</strong></a> on AI research for{' '}
              <strong>Excel Copilot</strong>, focusing on the evaluation and reliability of intelligent agents.
            </p>
            <p className="hero-description">
              Previously, I was a Research Engineer at{' '}
              <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-india/" target="_blank" rel="noopener noreferrer"><strong>Microsoft Research India</strong></a>, working on{' '}
              <a href="https://github.com/microsoft/Agentic-Shiksha/" target="_blank" rel="noopener noreferrer"><strong>Agentic Shiksha</strong></a>, an Agentic AI powered educational platform twinned with{' '}
              <a href="https://medium.com/@swamimanohar_73269/project-ekalaiva-the-six-pillars-of-educational-transformation-9e7c022b2964" target="_blank" rel="noopener noreferrer"><strong>Project EKALAIVA</strong></a>, under the mentorship of{' '}
              <a href="https://www.microsoft.com/en-us/research/people/swmanohmicrosoft-com/" target="_blank" rel="noopener noreferrer"><strong>Manohar Swaminathan</strong></a>.
            </p>
            <p className="hero-description">
              My research spans <strong>federated learning, machine unlearning, multimodal AI, NLP, and 2D &amp; 3D computer vision</strong>, with experience at{' '}
              <strong>Sarvam AI, NTU Singapore, and IIT Hyderabad</strong>, and publications in <strong>federated learning</strong> at workshops associated with{' '}
              <strong>IEEE INFOCOM 2025</strong> and <strong>AAAI 2025</strong>.
            </p>
            <p className="hero-description">
              I graduated from <strong>IIT Kharagpur in 2025</strong> with a B.Tech. (Honours) in Metallurgical &amp; Materials Engineering and a minor in Computer Science &amp; Engineering.
            </p>
            <p className="hero-description">
              My research interests center on <strong>reinforcement learning, multimodal learning, and agentic systems</strong>, with a growing interest in{' '}
              <strong>frontier model training, optimization, and robot learning</strong>. I am particularly interested in understanding the fundamental principles of learning and developing more capable, efficient, and generalizable intelligent systems.
            </p>
            <div className="hero-socials" role="group" aria-label="Contact and profile links">
              <a className="button" href={`mailto:${profile.email}`}><Mail size={18} aria-hidden="true" /> Email</a>
              <a className="button" href={profile.resume} target="_blank" rel="noopener noreferrer"><FileText size={18} aria-hidden="true" /> CV</a>
              <a className="button" href={profile.scholar} target="_blank" rel="noopener noreferrer"><GraduationCap size={18} aria-hidden="true" /> Google Scholar</a>
              <a className="button" href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={18} aria-hidden="true" /> GitHub</a>
              <a className="button" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} aria-hidden="true" /> LinkedIn</a>
            </div>
          </div>
          <div className="hero-art">
            <img className="hero-portrait" src={profile.portrait} alt={`Illustrated portrait of ${profile.name}`} width="800" height="800" />
            <ResearchField paused={animationsPaused} onToggle={() => setAnimationsPaused(value => !value)} />
            <div className="field-caption"><span><span className="status-dot" /> A conceptual research space</span><span aria-hidden="true">01 / &infin;</span></div>
          </div>
        </div>
        <div className="hero-bottom"><p>{profile.name} <span aria-hidden="true">/</span> {profile.location}</p><a href="#research">SCROLL TO EXPLORE <ArrowDown size={18} aria-hidden="true" /></a></div>
      </div>
    </section>
  );
};

export default Home;
