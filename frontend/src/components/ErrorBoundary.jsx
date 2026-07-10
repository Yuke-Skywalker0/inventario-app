import { Component } from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log dettagliato in console per il debug, mai mostrato all'utente.
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <p className="error-boundary-title">Qualcosa è andato storto</p>
          <p className="error-boundary-body">
            Riprova a ricaricare la pagina. Se il problema continua, i tuoi dati non sono a
            rischio: sono salvati sul server e, quando possibile, anche sul telefono.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Ricarica
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
