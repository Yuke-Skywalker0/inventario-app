import { useEffect, useState } from 'react';
import { listLocations } from '../api/locations';
import { listCategories } from '../api/products';
import './FiltersForm.css';

export default function FiltersForm({ value, onApply }) {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationId, setLocationId] = useState(value.locationId || '');
  const [category, setCategory] = useState(value.category || '');

  useEffect(() => {
    listLocations().then(setLocations).catch(() => {});
    listCategories().then(setCategories).catch(() => {});
  }, []);

  function handleApply() {
    onApply({ locationId, category });
  }

  function handleReset() {
    setLocationId('');
    setCategory('');
    onApply({ locationId: '', category: '' });
  }

  return (
    <div className="filters-form">
      <label className="filters-field">
        <span>Ubicazione</span>
        <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">Tutte</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      {categories.length > 0 && (
        <label className="filters-field">
          <span>Categoria</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tutte</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="filters-actions">
        <button type="button" className="filters-reset" onClick={handleReset}>
          Azzera
        </button>
        <button type="button" className="filters-apply" onClick={handleApply}>
          Applica
        </button>
      </div>
    </div>
  );
}
