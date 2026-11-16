import React from 'react';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import CopyButton from '../CopyButton/CopyButton';
import { profile } from '../../data/portfolio';

const Contact = () => {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-copy">
            <p className="eyebrow">LET&apos;S CONNECT</p>
            <h2 id="contact-heading">Good things start<br />with <em>a conversation.</em></h2>
            <p>Research questions, thoughtful collaborations, or an idea you can&apos;t stop thinking about. I&apos;d love to hear it.</p>
            <a className="button button-light" href={`mailto:${profile.email}`}>Say hello <ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="contact-card">
            <div className="contact-email-heading"><Mail size={21} strokeWidth={1.5} aria-hidden="true" /><span className="tiny-label">THE BEST WAY TO REACH ME</span></div>
            <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}</a>
            <CopyButton value={profile.email} label="Copy email address" successMessage="Email address copied." />
            <div className="contact-socials">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} aria-hidden="true" /><span>LinkedIn</span><ArrowUpRight size={16} aria-hidden="true" /></a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={18} aria-hidden="true" /><span>GitHub</span><ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <p className="contact-location"><span className="status-dot" /> Based in {profile.location}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;