import React from 'react';
import { navigation } from '../../data/portfolio';
import './SectionSelector.css';

export const sectionLinks = [
  ...navigation.filter(item => item.id !== 'explorations'),
  { id: 'about', label: 'Toolbox' },
];

export default function SectionSelector({ activeSection, onSelect }) {
  return (
    <nav className="section-selector" aria-label="Section selector">
      <ul>
        {sectionLinks.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-label={`Go to ${section.label}`}
              aria-current={activeSection === section.id ? 'location' : undefined}
              onClick={() => onSelect(section.id)}
            >
              <span className="section-selector-label" aria-hidden="true">{section.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
