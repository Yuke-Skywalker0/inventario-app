import { useRef, useState } from 'react';
import './Home.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  return (
    <div className="home">
      <div className="search-bar">
        <SearchGlyph />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          placeholder="Cerca un prodotto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="home-empty">
        <p className="home-empty-title">Non hai ancora prodotti</p>
        <p className="home-empty-body">
          Aggiungili con il pulsante <strong>+</strong> qui sotto: la ricerca, i filtri e le
          scorte basse arriveranno qui non appena i primi prodotti saranno stati inseriti.
        </p>
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
