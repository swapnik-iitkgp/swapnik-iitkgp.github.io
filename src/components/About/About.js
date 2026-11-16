import React from 'react';
import { ArrowUpRight, ChevronDown, GraduationCap } from 'lucide-react';
import SectionHeading from '../SectionHeading/SectionHeading';
import { profile } from '../../data/portfolio';
import { skillsData } from './skillsData';

const coursework = [
  'Reinforcement Learning',
  'Natural Language Processing',
  'Machine Learning',
  'Computer Vision',
  'Algorithms',
  'Probability & Statistics',
];

const About = () => (
  <section id="about" className="section about-section" aria-labelledby="about-heading">
    <div className="container">
      <SectionHeading
        id="about-heading"
        number="05"
        label="A LITTLE ABOUT ME"
        title={<>An engineer by training.<br /><em>A researcher by curiosity.</em></>}
      />
      <div className="about-grid">
        <div className="about-copy">
          <figure className="about-portrait"><img src={profile.portrait} alt={`Illustrated portrait of ${profile.name}`} width="800" height="800" loading="lazy" /><figcaption>THE PERSON BEHIND THE WORK.</figcaption></figure>
          <p className="about-lead">I&apos;m {profile.name}, an AI researcher and engineer based in Bengaluru.</p>
          <p>
            My path started in Metallurgical &amp; Materials Engineering at IIT Kharagpur,
            alongside a minor in Computer Science &amp; Engineering. That interdisciplinary
            foundation brought me to the questions I work on today.
          </p>
          <p>
            How can agents support better learning? How do language models reason?
            What should a model forget? My work spans agentic systems, reinforcement
            learning, machine unlearning, and computer vision.
          </p>
          <p>
            I&apos;ve explored these questions across industry and academic teams, from
            Microsoft and Sarvam to NTU Singapore and IIT research labs.
          </p>
          <div className="beyond-work">
            <span className="tiny-label">BEYOND THE EXPERIMENTS</span>
            <p>AI leadership at SPARK4AI. Building with KodeinKGP. Thinking a few moves ahead with the IIT Kharagpur Chess Club.</p>
          </div>
          <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">Get the full picture in my resume <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="education-card">
          <div className="education-topline"><span className="eyebrow">THE FOUNDATION</span><GraduationCap size={27} strokeWidth={1.5} aria-hidden="true" /></div>
          <p className="education-year">Class of 2025</p>
          <h3>IIT Kharagpur</h3>
          <p className="education-degree">B.Tech (Honours)<br />Metallurgical &amp; Materials Engineering</p>
          <p className="education-minor">Minor in Computer Science &amp; Engineering</p>
          <div className="education-grade"><strong>8.33<span>/10</span></strong><span>CGPA</span></div>
          <div className="coursework">
            <h4>Selected coursework</h4>
            <ul>{coursework.map((course) => <li key={course}>{course}</li>)}</ul>
          </div>
          <details className="earlier-education">
            <summary>Earlier education <ChevronDown size={16} aria-hidden="true" /></summary>
            <div><p><strong>Class XII / 2021</strong><br />Sri Chaitanya Junior Kalasala &middot; 98.4%</p><p><strong>Class X / 2019</strong><br />Akshara Concept School &middot; 9.3/10</p></div>
          </details>
        </div>
      </div>
      <div className="toolbox">
        <div className="toolbox-heading"><h3>The toolbox</h3><p>From first experiment to working system.</p></div>
        <div className="skills-grid">
          {skillsData.map((group, index) => (
            <div className="skill-group" key={group.category}>
              <span className="skill-index">0{index + 1}</span>
              <h4>{group.category}</h4>
              <ul className="tag-list">{group.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
