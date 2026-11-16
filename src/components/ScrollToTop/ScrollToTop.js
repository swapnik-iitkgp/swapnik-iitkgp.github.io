import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => setVisible(window.scrollY > 700);
    toggleVisible();
    window.addEventListener('scroll', toggleVisible, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  if (!visible) return null;

  return <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUp size={19} aria-hidden="true" /></a>;
}

export default ScrollToTop;
