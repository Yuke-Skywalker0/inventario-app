# Project State

_Ultimo aggiornamento: Fase 12 completata (Prodotti + quantità)._

## Fase corrente
Fase 12 completata (in realtà copre anche il cuore delle Fasi 13-14: quantità per
ubicazione e movimenti automatici). 34/34 test backend passati, build frontend pulita.
In attesa di push + deploy + verifica su dispositivo reale.

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Repository, backend foundation, autenticazione completa (Fase 6-7)
- [x] Frontend foundation: design system, navigazione, PWA, auth (Fase 8) — verificato su dispositivo
- [x] Ubicazioni: CRUD completo, backend + frontend (Fase 11)
- [x] **Prodotti**: CRUD completo con flusso rapido (titolo+quantità+unità+ubicazione) e
      dettagli progressivi opzionali (categoria, marca, colore, misura, note, scorta minima)
- [x] **Quantità per ubicazione**: modifica atomica e idempotente tramite transazione MongoDB
      reale (Atlas M0 è un replica set) + unique index su clientOpId — stesso meccanismo che
      servirà quando arriverà la sincronizzazione offline (Fase 21), niente da rifare
- [x] **Movimenti**: ogni modifica quantità genera automaticamente un movimento (Sezione 16:
      "per un +1/-1 non chiedere un modulo" — rispettato, è automatico)
- [x] Ricerca prodotti per titolo (base — la ricerca multi-campo con filtri avanzati è Fase 16)
- [x] Azioni rapide: +1/−1 inline in lista (se il prodotto ha una sola ubicazione), stepper
      completo (−5/−1/+1/+5/personalizzata) nella scheda prodotto
- [x] Scheda prodotto dedicata: quantità per ubicazione, aggiunta a nuove ubicazioni, modifica,
      archiviazione
- [x] 34 test automatici backend (validazione pura, nessuna dipendenza da MongoDB reale)

## In corso
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: creare un prodotto, modificarne la quantità, verificare
      che due tocchi rapidi in sequenza non creino incoerenze

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 15: Trasferimenti tra ubicazioni (un'interfaccia dedicata; il backend potrebbe già
  quasi supportarlo componendo due adjust, ma un vero trasferimento atomico A→B merita
  un endpoint proprio — prossima fase naturale)
- Fase 16: Ricerca multi-campo avanzata + filtri (chip, bottom sheet filtri)
- Fase 17: Immagini prodotto (upload su Backblaze B2)
- Fase 18: Lista da comprare (scorte basse → aggiunta automatica)
- Fase 19-20: Barcode/QR, voce
- Fase 21: Offline reale (IndexedDB, coda di sync) — l'idempotenza lato server è già pronta
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
Nessuno noto. Nota di design: la cronologia movimenti (Sezione 17) esiste già nel database
(ogni /adjust crea un Movement) ma non ha ancora una schermata dedicata — i dati ci sono,
manca solo la UI.

## Bug noti
Nessuno. Test automatici backend: 34/34 passati. Build frontend: pulita.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti su Render). Risolto.
