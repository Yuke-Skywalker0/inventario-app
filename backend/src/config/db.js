const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI non impostata nelle variabili ambiente');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('[db] Connesso a MongoDB Atlas');

  mongoose.connection.on('error', (err) => {
    console.error('[db] Errore connessione MongoDB:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Disconnesso da MongoDB, mongoose tenterà la riconnessione automatica');
  });
}

module.exports = { connectDB };
