import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { CountdownLab, ProjectVisual } from '../../researchVisuals';
import { profile } from '../../data/portfolio';

export default function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    closeButton.current.focus();
    document.body.classList.add('dialog-open');
    return () => {
      dialog.close();
      document.body.classList.remove('dialog-open');
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-toolbar">
        <span className="eyebrow">PROJECT NOTES</span>
        <button ref={closeButton} type="button" className="close-button" onClick={onClose} aria-label="Close project details"><X size={21} aria-hidden="true" /></button>
      </div>
      <div className="dialog-inner">
        <p className="eyebrow">{project.category} <span>/</span> {project.year}</p>
        <h2 id="dialog-title">{project.title}</h2>
        <p id="dialog-description" className="dialog-intro">{project.description}</p>
        <div className={`dialog-visual visual-${project.visual}`} role="img" aria-label={`Conceptual illustration for ${project.title}`}><ProjectVisual type={project.visual} /></div>
        <div className="detail-grid"><div><h3>The question</h3><p>{project.question}</p></div><div><h3>The approach</h3><p>{project.approach}</p></div></div>
        <h3>What I built</h3>
        <ul className="detail-list">{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
        {project.visual === 'reasoning' && <CountdownLab />}
        <p className="evidence-note">{project.context}</p>
        <ul className="tag-list" aria-label="Technologies used">{project.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
        <div className="dialog-links">
          {project.url && <a className="button button-primary" href={project.url} target="_blank" rel="noopener noreferrer">Explore the code <ArrowUpRight size={17} aria-hidden="true" /></a>}
          <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">Full resume <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
    </dialog>
  );
}
