import './LocationCard.css';

const TYPE_LABELS = {
  magazzino: 'Magazzino',
  furgone: 'Furgone',
  deposito: 'Deposito',
  garage: 'Garage',
  altro: 'Altro'
};

export default function LocationCard({ location, onEdit, onToggleActive }) {
  return (
    <div className={`location-card${location.active ? '' : ' is-inactive'}`}>
      <button type="button" className="location-card-main" onClick={() => onEdit(location)}>
        <span className="location-card-type">{TYPE_LABELS[location.type] || 'Altro'}</span>
        <span className="location-card-name">{location.name}</span>
        {location.description && (
          <span className="location-card-desc">{location.description}</span>
        )}
      </button>

      <button
        type="button"
        className="location-card-toggle"
        onClick={() => onToggleActive(location)}
        aria-label={location.active ? 'Archivia' : 'Riattiva'}
      >
        {location.active ? 'Archivia' : 'Riattiva'}
      </button>
    </div>
  );
}
