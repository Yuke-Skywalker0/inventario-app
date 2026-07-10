import './Fab.css';

export default function Fab({ label, onClick }) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
