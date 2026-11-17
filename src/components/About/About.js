import React from 'react';
import { skillsData } from './skillsData';

const About = () => (
  <section id="about" className="section toolbox-section" aria-labelledby="toolbox-heading">
    <div className="container">
      <div className="toolbox">
        <div className="toolbox-heading"><h2 id="toolbox-heading">The toolbox</h2><p>From first experiment to working system.</p></div>
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
