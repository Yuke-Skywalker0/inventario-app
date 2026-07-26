# Test end-to-end (Playwright)

## Perché esistono ma non sono stati eseguiti da Claude

La sandbox di sviluppo usata per costruire questo progetto blocca l'accesso al dominio da cui
Playwright scarica il browser Chromium (`cdn.playwright.dev` non è nella lista dei domini
consentiti — lo stesso identico problema incontrato con il download del binario MongoDB
all'inizio del progetto). Questi test sono quindi scritti con cura sui selettori reali
dell'interfaccia (stessi testi, placeholder e ruoli usati nel codice), ma **non sono mai stati
eseguiti per davvero**. Vanno considerati un buon punto di partenza da verificare, non una
garanzia assoluta — è possibile che il primo tentativo richieda qualche piccolo aggiustamento.

## Cosa coprono

- `e2e/auth.spec.js` — registrazione, logout, login con credenziali sbagliate
- `e2e/locations.spec.js` — creazione e archiviazione di una ubicazione
- `e2e/products.spec.js` — creazione prodotto con quantità, pulsante +1 rapido, scheda prodotto

## Come eseguirli in locale

1. Installa le dipendenze e il browser (questo passaggio richiede una rete senza le
   restrizioni della sandbox — sul tuo computer funzionerà normalmente):
   ```bash
   cd frontend
   npm install
   npx playwright install chromium
   ```

2. Avvia backend e frontend in due terminali separati:
   ```bash
   # Terminale 1
   cd backend
   npm run dev

   # Terminale 2
   cd frontend
   npm run dev
   ```
   Assicurati che il file `.env` del backend punti a un database MongoDB Atlas raggiungibile
   (va benissimo lo stesso cluster di sviluppo, i test creano solo dati di prova con email
   uniche ad ogni esecuzione, non toccano dati esistenti).

3. In un terzo terminale, esegui i test:
   ```bash
   cd frontend
   npm run test:e2e
   ```

   Per vederli girare in un browser vero invece che in background:
   ```bash
   npx playwright test --headed
   ```

## Se qualcosa non passa al primo colpo

I selettori sono basati sui testi esatti dell'interfaccia (es. "Crea account", "Cerca un
prodotto…"): se nel frattempo hai modificato quei testi, i test vanno aggiornati di
conseguenza. Playwright genera automaticamente screenshot e video dei test falliti (cartella
`test-results/`), utili per capire subito cosa è successo.
