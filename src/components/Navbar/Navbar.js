import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navigation } from '../../data/portfolio';
import SectionSelector, { sectionLinks } from '../SectionSelector/SectionSelector';

const Navbar = ({ isExplorations = false, hasScrolled }) => {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(isExplorations ? 'explorations' : 'home');
  const menuButton = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    if (isExplorations || !window.IntersectionObserver) return undefined;
    let observer;
    const observeSections = () => {
      observer?.disconnect();
      const height = window.innerHeight;
      // Percentage root margins use viewport width, including the vertical edges.
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      }, { rootMargin: `-${height * 0.15}px 0px -${height * 0.65}px 0px` });

      ['home', ...sectionLinks.map(item => item.id)].forEach(id => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    };
    observeSections();
    window.addEventListener('resize', observeSections);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observeSections);
    };
  }, [isExplorations]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNavOpen(false);
        menuButton.current.focus();
      }
    };
    const handleOutsideClick = (event) => {
      if (!header.current.contains(event.target)) setNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [navOpen]);

  return (
    <>
    <header className="site-header" ref={header}>
      <div className="container nav-inner">
        <a
          className="nav-welcome"
          href={isExplorations ? '/#home' : '#home'}
          aria-current={activeSection === 'home' ? 'location' : undefined}
          onClick={() => {
            setActiveSection('home');
            setNavOpen(false);
          }}
        >
          <span>The Curious Neuron</span>
        </a>
        <button
          ref={menuButton}
          type="button"
          className="menu-toggle"
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="primary-navigation" className={`main-nav${navOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
          <ul className="nav-links">
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  href={item.id === 'explorations' ? '/explorations/' : `${isExplorations ? '/' : ''}#${item.id}`}
                  className={item.id === 'explorations' ? 'nav-explorations' : undefined}
                  aria-current={activeSection === item.id ? (isExplorations ? 'page' : 'location') : undefined}
                  onClick={() => {
                    setActiveSection(item.id);
                    setNavOpen(false);
                  }}
                >
                  {item.label}
                  {item.id === 'explorations' && <ArrowUpRight size={15} aria-hidden="true" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
    {!isExplorations && hasScrolled && activeSection !== 'home' && <SectionSelector activeSection={activeSection} onSelect={setActiveSection} />}
    </>
  );
};

export default Navbar;
