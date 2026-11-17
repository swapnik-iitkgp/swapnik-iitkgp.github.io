import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import InfectionBackground from './components/InfectionBackground/InfectionBackground';
import Home from './components/Home/Home';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import ProjectDialog from './components/Projects/ProjectDialog';
import Research from './components/Research/Research';
import Publications from './components/Publications/Publications';
import About from './components/About/About';
import Explorations from './components/Explorations/Explorations';
import { profile, projects } from './data/portfolio';
import './App.css';

function App() {
  const isExplorations = /^\/explorations\/?$/.test(window.location.pathname);
  const [projectFilter, setProjectFilter] = useState('All work');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectNotice, setProjectNotice] = useState('');
  const [hasScrolled, setHasScrolled] = useState(() => window.scrollY > 40);

  useEffect(() => {
    if (isExplorations) return undefined;
    const handleScroll = () => setHasScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExplorations]);

  useEffect(() => {
    const readProjectLink = () => {
      const match = window.location.hash.match(/^#project-(.+)$/);
      const id = match?.[1] === 'countdown-reasoner' ? 'countdown' : match?.[1];
      const project = id ? projects.find(item => item.id === id) : null;
      setSelectedProject(project || null);
      setProjectNotice(id && !project ? 'This project link is not available. Please choose a project from the selected work below.' : '');
    };
    readProjectLink();
    window.addEventListener('hashchange', readProjectLink);
    window.addEventListener('popstate', readProjectLink);
    return () => {
      window.removeEventListener('hashchange', readProjectLink);
      window.removeEventListener('popstate', readProjectLink);
    };
  }, []);

  const openProject = project => {
    window.history.pushState(null, '', `#project-${project.id}`);
    setProjectNotice('');
    setSelectedProject(project);
  };
  const closeProject = () => {
    window.history.replaceState(null, '', '#projects');
    setSelectedProject(null);
    setProjectNotice('');
  };

  return (
    <div className="site-shell">
      <InfectionBackground />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar isExplorations={isExplorations} hasScrolled={hasScrolled} />
      {projectNotice && <div className="container project-notice" role="alert"><p>{projectNotice}</p><button type="button" className="text-link" onClick={closeProject}>Dismiss</button></div>}
      <main id="main-content" tabIndex={-1}>
        {isExplorations ? <Explorations /> : <>
        <Home hasScrolled={hasScrolled} />
        <Research onSelect={setProjectFilter} />
        <Projects filter={projectFilter} onFilterChange={setProjectFilter} onOpen={openProject} />
        <Publications />
        <Experience />
        <About />
        </>}
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="footer-copyright">&copy; {new Date().getFullYear()} {profile.name}</p>
          <div className="footer-meta">
            <p>Last updated <time dateTime={profile.lastUpdated}>{new Date(`${profile.lastUpdated}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></p>
            <a className="footer-contact" href={`mailto:${profile.email}`}>Get in touch</a>
          </div>
        </div>
      </footer>
      {selectedProject && <ProjectDialog key={selectedProject.id} project={selectedProject} onClose={closeProject} />}
    </div>
  );
}

export default App;
