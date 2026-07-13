# Project State

_Ultimo aggiornamento: Fase 19-20 completata (Barcode/QR + Ricerca vocale)._

## Fase corrente
Fase 19-20 completata. 60/60 test backend (invariati, nessuna modifica al backend per questa
fase). Build frontend pulita (321 moduli, scanner in chunk separato caricato solo on-demand).
In attesa di push + deploy + verifica reale.

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini, bucket PRIVATO).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Fase 6-8, 11, 12/13/14, 15, 16, 17, 18: vedi cronologia Git
- [x] Fix immagini (bucket privato + URL firmate) — confermato funzionante dall'utente
- [x] "Ricordami" al login
- [x] **Fase 19: Barcode/QR** — verificato che l'API nativa `BarcodeDetector` NON funziona su
      Safari/iPhone (bug noto mai risolto da Apple), quindi usata la libreria open source
      `@zxing/browser` che funziona ovunque via elaborazione JS del flusso video. Caricata
      solo on-demand (code-splitting) per non appesantire il caricamento iniziale. Fallback
      manuale (inserimento a mano del codice) sempre presente se la fotocamera non è
      disponibile o il permesso viene negato. Collegato in due punti:
      - Home: pulsante scanner accanto alla ricerca → il codice letto riempie la ricerca
        (che dalla Fase 16 cerca già anche per barcode)
      - Form prodotto: campo barcode con pulsante "Scansiona", in creazione e modifica
- [x] **Fase 20: Ricerca vocale** — Web Speech API nativa, in italiano. Il pulsante
      microfono compare SOLO se il browser lo supporta davvero (rilevato a runtime: bene su
      Chrome, non su Firefox, incostante su Safari) — nessuna finta compatibilità universale,
      il fallback è semplicemente scrivere a mano, sempre disponibile. Solo ricerca vocale in
      questa fase, non comandi vocali completi (es. "togli 2 raccordi") — quella è una
      funzione più complessa (serve interpretare intento + quantità + prodotto + conferma)
      che ho tenuto volutamente separata, si può fare come fase successiva se utile

## In corso
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: scansionare un barcode vero, provare la ricerca vocale
      (probabilmente disponibile se usi Chrome su Android)

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Comandi vocali completi (es. "togli 2 raccordi da 20"), se utile oltre alla sola ricerca
- Fase 21: Offline reale (IndexedDB, coda di sync) — l'idempotenza lato server è già pronta
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
- Il filtro di stato (scorta bassa/esaurito) si applica dopo il fetch (max 500 risultati).
- URL firmate immagini scadono dopo 6 ore, rigenerate automaticamente ad ogni fetch.
- Cronologia movimenti esiste nel DB ma non ha ancora una schermata dedicata.
- `@zxing/library` richiede Node ≥24 secondo il suo package.json (noi abbiamo Node 22 in
  sviluppo): è solo un warning npm, non blocca build o funzionamento, ma da tenere d'occhio
  se in futuro si aggiornano le dipendenze.

## Bug noti
Nessuno. Test automatici backend: 60/60 passati.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti). Risolto.
- **[Fase 17] ACL Backblaze non supportata; poi bucket pubblico a pagamento.** Risolto con
  bucket privato + URL firmate. Confermato funzionante dall'utente.
- **[Fase 17] `ERR_INVALID_URL`** (endpoint B2 senza https://). Risolto.
- **[Warning] `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`** (mancava trust proxy). Risolto.
