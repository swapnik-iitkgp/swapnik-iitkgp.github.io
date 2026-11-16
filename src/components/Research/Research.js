import React from 'react';
import { ArrowUpRight, BrainCircuit, Network, Scan } from 'lucide-react';
import SectionHeading from '../SectionHeading/SectionHeading';

const directions = [
  { title: 'Agents & evaluation', filter: 'Agent systems', icon: Network, description: 'How do we build agents whose decisions, outputs, and learning progress we can meaningfully evaluate?', topics: 'Reliability / Orchestration' },
  { title: 'Learning & reasoning', filter: 'Model learning', icon: BrainCircuit, description: 'How can better objectives, reinforcement learning, and adaptation make models more capable?', topics: 'RL / Optimization / Adaptation' },
  { title: 'Perception & embodied AI', filter: 'Perception', icon: Scan, description: 'How do visual and spatial representations connect perception to useful action in the physical world?', topics: '3D vision / Robotics' },
];

export default function Research({ onSelect }) {
  return (
    <section id="research" className="section research-section" aria-labelledby="research-heading">
      <div className="container">
        <SectionHeading id="research-heading" number="01" label="RESEARCH DIRECTIONS" title={<>Better learning.<br /><em>More useful intelligence.</em></>} description="The questions connecting my work, from learning algorithms to systems that people can use." />
        <div className="research-directions">
          {directions.map((direction, index) => {
            const Icon = direction.icon;
            return (
              <a key={direction.filter} href="#projects" onClick={() => onSelect(direction.filter)} aria-label={`Explore ${direction.title}`}>
                <span className="direction-number">0{index + 1}</span>
                <Icon className="direction-icon" size={30} strokeWidth={1.2} aria-hidden="true" />
                <h3>{direction.title}</h3>
                <p>{direction.description}</p>
                <span className="direction-footer">{direction.topics}<ArrowUpRight size={17} aria-hidden="true" /></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
