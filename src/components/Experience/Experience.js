import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import SectionHeading from '../SectionHeading/SectionHeading';
import { experiences, profile } from '../../data/portfolio';

const categories = ['Industry', 'Research', 'Leadership'];

const Experience = () => {
  const [category, setCategory] = useState('Industry');
  const visibleExperiences = experiences.filter((item) => item.category === category);

  return (
    <section id="experience" className="section experience-section" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading
          id="experience-heading"
          number="04"
          label="THE JOURNEY"
          title={<>Different teams.<br /><em>The same curiosity.</em></>}
          description="From perception and language to agents that work together. A journey across research labs, startups, and Microsoft."
        />
        <div className="experience-layout">
          <aside className="experience-sidebar">
            <div className="experience-filters" role="group" aria-label="Filter experience">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={category === item}
                  aria-controls="experience-list"
                  onClick={() => setCategory(item)}
                >
                  {item}<span>{String(experiences.filter((entry) => entry.category === item).length).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
            <p className="sidebar-note">Every team brought a new problem.<br />Every problem, a new perspective.</p>
            <a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              The full story on LinkedIn <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </aside>
          <div>
            <p className="sr-only" role="status">{visibleExperiences.length} {category.toLowerCase()} experiences</p>
            <div className="experience-list" id="experience-list">
              {visibleExperiences.map((entry) => (
                <details key={entry.id} className={`experience-entry${entry.current ? ' current-entry' : ''}`} open={entry.current || undefined}>
                  <summary>
                    <span className={`organization-mark${entry.current ? ' organization-microsoft' : ''}`} aria-hidden="true">
                      {entry.current ? <span className="microsoft-mark"><i /><i /><i /><i /></span> : entry.initials}
                    </span>
                    <span className="experience-summary">
                      <span className="organization-name">{entry.organization}{entry.current && <span className="current-badge">Current</span>}</span>
                      <span className="organization-role">{entry.roles[0].title}</span>
                    </span>
                    <span className="experience-period">{entry.roles[0].period}</span>
                    <ChevronDown className="details-chevron" size={18} aria-hidden="true" />
                  </summary>
                  <div className="experience-details">
                    <p className="experience-location">
                      {entry.location}
                      {entry.roles.length > 1 && <span className="experience-tenure">Overall tenure: {entry.period}</span>}
                    </p>
                    {entry.roles.map((role) => (
                      <div className="role-block" key={role.title}>
                        <div className="role-heading"><h3>{role.title}</h3><span>{role.period}</span></div>
                        {role.points.length > 0 && <ul className="experience-points">{role.points.map((point) => <li key={point}>{point}</li>)}</ul>}
                      </div>
                    ))}
                    <ul className="tag-list" aria-label="Skills used">{entry.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                    {entry.link && <a className="text-link experience-project-link" href={entry.link} target="_blank" rel="noopener noreferrer">{entry.linkLabel} <ArrowUpRight size={16} aria-hidden="true" /></a>}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;