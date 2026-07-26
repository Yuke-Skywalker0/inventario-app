# Test end-to-end (Playwright)

> **Nota**: `@playwright/test` non è elencato nel `package.json` del progetto di proposito.
> Includerlo ha causato un fallimento del deploy su Cloudflare (`npm ci` pretende che
> `package.json` e `package-lock.json` siano perfettamente sincronizzati, e il lock file va
> rigenerato ogni volta che si aggiunge una dipendenza — un dettaglio facile da dimenticare).
> Per usare i test, installalo come pacchetto separato (istruzioni sotto).

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

1. Installa Playwright (**non è incluso in `package.json`** apposta: se lo fosse, `npm ci`
   fallirebbe sul deploy Cloudflare per un lock file fuori sincrono — è già successo una volta.
   Installalo quindi come pacchetto a sé quando vuoi usare i test):
   ```bash
   cd frontend
   npm install
   npm install --save-dev @playwright/test
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
