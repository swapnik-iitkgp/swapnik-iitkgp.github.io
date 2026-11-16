import React from 'react';

const SectionHeading = ({ id, number, label, title, description }) => (
  <div className="section-heading">
    <div>
      <p className="eyebrow"><span className="section-number">{number} /</span> {label}</p>
      <h2 id={id}>{title}</h2>
    </div>
    {description && <p className="section-description">{description}</p>}
  </div>
);

export default SectionHeading;
