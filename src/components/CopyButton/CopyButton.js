import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ value, label, successMessage }) {
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (state !== 'copied') return undefined;
    const timer = window.setTimeout(() => setState('idle'), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setState('error');
      return;
    }
    setState('copying');
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="copy-control">
      <button type="button" className="copy-button text-link" onClick={copy} disabled={state === 'copying'} aria-label={label}>
        {state === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {state === 'copied' ? 'Copied!' : state === 'copying' ? 'Copying...' : label}
      </button>
      <p className="copy-status" role="status">{state === 'copied' ? successMessage : state === 'error' ? 'Could not copy. Please select and copy the text below instead.' : ''}</p>
      {state === 'error' && <textarea className="copy-fallback" aria-label={`Manual copy: ${label}`} value={value} readOnly rows={2} onFocus={event => event.currentTarget.select()} />}
    </div>
  );
}
