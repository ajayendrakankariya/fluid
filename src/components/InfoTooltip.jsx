import { Info } from 'lucide-react';

/**
 * InfoTooltip — wraps any content with an info icon + tooltip bubble
 * @param {string} tip - The tooltip text
 * @param {ReactNode} children - The content to wrap (default: just an info icon)
 */
export default function InfoTooltip({ tip, children }) {
  return (
    <span className="tooltip-wrapper" role="tooltip" aria-label={tip}>
      {children}
      <span className="tooltip-icon" aria-hidden="true">
        <Info size={9} />
      </span>
      <span className="tooltip-bubble">{tip}</span>
    </span>
  );
}
