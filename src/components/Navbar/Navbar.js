import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { navigation } from '../../data/portfolio';

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const menuButton = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    if (!window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-15% 0px -65% 0px' });

    ['home', ...navigation.map((item) => item.id)].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

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
    <header className="site-header" ref={header}>
      <div className="container nav-inner">
        <a
          className="nav-welcome"
          href="#home"
          aria-current={activeSection === 'home' ? 'location' : undefined}
          onClick={() => {
            setActiveSection('home');
            setNavOpen(false);
          }}
        >
          The Curious Neuron
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
                  href={`#${item.id}`}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                  onClick={() => {
                    setActiveSection(item.id);
                    setNavOpen(false);
                  }}
                >
                {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
