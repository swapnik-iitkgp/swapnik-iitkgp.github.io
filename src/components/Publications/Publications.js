import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import SectionHeading from '../SectionHeading/SectionHeading';
import CopyButton from '../CopyButton/CopyButton';
import { publications } from '../../data/portfolio';

const Publications = () => (
  <section id="publications" className="section publications-section" aria-labelledby="publications-heading">
    <div className="container">
      <SectionHeading
        id="publications-heading"
        number="03"
        label="RESEARCH & PUBLICATIONS"
        title={<>Questions worth<br /><em>looking into.</em></>}
        description="Selected workshop papers on learning across distributed data and making AI systems more responsible."
      />
      <div className="publication-list">
        {publications.map((publication, index) => (
          <article className="publication-card" key={publication.id} aria-labelledby={`paper-${publication.id}`}>
            <div className="publication-marker">
              <span className="publication-index">0{index + 1}</span>
              <span>{publication.shortVenue}<br /><strong>{publication.year}</strong></span>
            </div>
            <div className="publication-content">
              <div className="publication-topline"><span className="tiny-label">WORKSHOP PAPER</span><span className="accepted-badge">{publication.status}</span></div>
              <h3 id={`paper-${publication.id}`}><a href={publication.url} target="_blank" rel="noopener noreferrer">{publication.title}</a></h3>
              <p className="publication-authors">{publication.authors}</p>
              <p className="publication-venue">{publication.venue}</p>
              <div className="publication-bottom">
                <ul className="tag-list" aria-label="Research topics">{publication.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                <div className="publication-actions">
                  <a className="text-link" href={publication.url} target="_blank" rel="noopener noreferrer" aria-label={`Read publication: ${publication.title}`}>Read publication <ArrowUpRight size={17} aria-hidden="true" /></a>
                  <CopyButton label="Copy citation" successMessage="Citation copied." value={`${publication.authors.replace(/\*/g, '')} (${publication.year}). ${publication.title}. ${publication.venue}. ${publication.url}`} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="publication-note">* Major contribution. Author order is shown as listed in the resume.</p>
    </div>
  </section>
);

export default Publications;
