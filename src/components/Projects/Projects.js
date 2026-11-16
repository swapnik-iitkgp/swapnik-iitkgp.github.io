import React, { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import SectionHeading from '../SectionHeading/SectionHeading';
import { ProjectVisual } from '../../researchVisuals';
import { projects } from '../../data/portfolio';

const filters = ['All work', 'Agent systems', 'Model learning', 'Perception'];

const Projects = ({ filter, onFilterChange, onOpen }) => {
  const [showAll, setShowAll] = useState(false);
  const filteredProjects = filter === 'All work' ? projects : projects.filter(project => project.category === filter);
  const visibleProjects = filter === 'All work' && !showAll ? filteredProjects.slice(0, 4) : filteredProjects;

  return (
    <section id="projects" className="section projects-section" aria-labelledby="projects-heading">
      <div className="container">
        <SectionHeading
          id="projects-heading"
          number="02"
          label="SELECTED WORK"
          title={<>From questions<br /><em>to working systems.</em></>}
          description="Systems, experiments, and the questions behind them. From AI for education to the mechanics of reasoning and collaboration."
        />
        <div className="filter-bar" role="group" aria-label="Filter projects">
          {filters.map((item) => (
            <button type="button" key={item} aria-pressed={filter === item} aria-controls="project-list" onClick={() => { onFilterChange(item); setShowAll(false); }}>{item}</button>
          ))}
        </div>
        <p className="work-count" role="status">{visibleProjects.length} of {filteredProjects.length} projects shown</p>
        <div className="project-grid" id="project-list">
          {visibleProjects.map(project => (
            <article className="project-card" key={project.id} aria-labelledby={`project-title-${project.id}`}>
              <button type="button" className={`project-visual-button visual-${project.visual}`} onClick={() => onOpen(project)} aria-label={`Read about ${project.title}`} aria-haspopup="dialog">
                <span className="visual-label"><span>{project.organization}</span><span>{project.year}</span></span>
                <ProjectVisual type={project.visual} />
                <span className="visual-open"><ArrowUpRight size={18} aria-hidden="true" /></span>
              </button>
              <div className="project-content">
                <p className="eyebrow">{project.category} <span>/</span> {project.type}</p>
                <h3 id={`project-title-${project.id}`}><button type="button" onClick={() => onOpen(project)} aria-haspopup="dialog">{project.title}</button></h3>
                <p>{project.description}</p>
                <div className="project-meta"><span>{project.highlight}</span><button type="button" className="text-link" onClick={() => onOpen(project)} aria-label={`Open ${project.title}`} aria-haspopup="dialog">Explore <ArrowUpRight size={17} aria-hidden="true" /></button></div>
              </div>
            </article>
          ))}
        </div>
        {filter === 'All work' && <div className="show-more"><button type="button" className="button button-outline" aria-expanded={showAll} aria-controls="project-list" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show selected work' : `View all ${projects.length} projects`}{showAll ? <Minus size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}</button></div>}
        <p className="project-footnote">Results are specific to the datasets and experiments described in my resume.</p>
      </div>
    </section>
  );
};

export default Projects;
