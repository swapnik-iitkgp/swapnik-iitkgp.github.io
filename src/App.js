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
import Contact from './components/Contact/Contact';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { profile, projects } from './data/portfolio';
import './App.css';

function App() {
  const [projectFilter, setProjectFilter] = useState('All work');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectNotice, setProjectNotice] = useState('');

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
      <Navbar />
      {projectNotice && <div className="container project-notice" role="alert"><p>{projectNotice}</p><button type="button" className="text-link" onClick={closeProject}>Dismiss</button></div>}
      <main id="main-content" tabIndex={-1}>
        <Home />
        <Research onSelect={setProjectFilter} />
        <Projects filter={projectFilter} onFilterChange={setProjectFilter} onOpen={openProject} />
        <Publications />
        <Experience />
        <About />
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="footer-signature" href="#home">Swapnik<span>.</span></a>
          <p>&copy; {new Date().getFullYear()} {profile.name}</p>
          <a href="#home">Back to the top <span aria-hidden="true">&uarr;</span></a>
        </div>
      </footer>
      <ScrollToTop />
      {selectedProject && <ProjectDialog key={selectedProject.id} project={selectedProject} onClose={closeProject} />}
    </div>
  );
}

export default App;
