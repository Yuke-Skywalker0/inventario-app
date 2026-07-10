// Wrapper per evitare try/catch ripetuti in ogni controller async.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Handler centrale: logga l'errore completo lato server, ma risponde
// al client con un messaggio generico (mai stack trace o dettagli interni).
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Risorsa già esistente' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Dati non validi' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Errore interno del server' : err.message;
  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Risorsa non trovata' });
}

module.exports = { asyncHandler, errorHandler, notFoundHandler };
