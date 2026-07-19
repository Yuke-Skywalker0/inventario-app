# Project State

_Ultimo aggiornamento: Cronologia movimenti + Export/backup + Comandi vocali completati._

## Fase corrente
Tutte e tre le funzioni rimaste in lista sono state costruite. 67/67 test backend, build
frontend pulita (333 moduli).

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini, bucket PRIVATO).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Fase 6-8, 11-21: vedi cronologia Git (tutte le fasi precedenti)
- [x] Fix immagini, "Ricordami", fix form annidato scanner, creazione prodotto offline
- [x] **Cronologia movimenti (Sezione 17)**: sezione "Cronologia" nella scheda prodotto,
      testo leggibile ("Luca ha rimosso 2 raccordi dal Furgone 1"), i dati esistevano già
      nel DB dalla Fase 12 — qui solo la UI per vederli. Nuovo endpoint
      `GET /products/:id/movements`
- [x] **Export/backup (Sezione 59)**: nel Profilo, due pulsanti — backup completo JSON
      (ubicazioni + prodotti + movimenti) e prodotti in CSV (compatibile Excel, con BOM UTF-8
      per gli accenti). Download autenticato vero (blob), non un link diretto. **Import/
      ripristino non implementato** — scelta di scopo: servirebbe gestire conflitti/ID
      duplicati, più complesso del valore per un'app personale; l'export da solo protegge
      comunque dal essere "bloccati per sempre" su questo servizio (l'obiettivo della Sezione 59)
- [x] **Comandi vocali (Sezione 20)**: riconosce "togli/rimuovi/leva N [prodotto]" e
      "aggiungi/metti N [prodotto]" con numeri sia a cifre che a parole (uno-venti), sempre
      con schermata di conferma prima di applicare, disambiguazione se più prodotti
      corrispondono, scelta ubicazione se il prodotto ne ha più di una. "Mostrami cosa sta
      finendo" attiva il filtro scorta bassa. Ogni frase non riconosciuta ricade sulla
      ricerca semplice, mai un'azione indovinata. Nessuna AI, solo regole — verificato con
      tutti gli esempi testuali del brief originale
- [x] 67 test automatici backend (+ verifiche manuali mirate per parser vocale e rimappatura
      coda offline, non essendoci un test runner frontend configurato)

## In corso
- [ ] Push del codice su GitHub → deploy automatico (usa sempre la checklist sotto)
- [ ] Test: apri un prodotto → "Cronologia" → verifica che i movimenti passati siano leggibili
- [ ] Test: Profilo → scarica backup JSON e CSV, controlla che si aprano correttamente
- [ ] Test comando vocale: prova "togli due [nome di un tuo prodotto]" e verifica la conferma

## Checklist di verifica deploy (SEMPRE, prima di segnalare qualcosa come "mancante")
1. `ls frontend/src/offline/` → devono esserci 4 file
2. `git status` prima di commit → controlla che tutti i file nuovi siano elencati
3. Render → Events e Cloudflare → Deployments → l'orario dell'ultimo deploy deve essere recente

## Mancante (davvero, questa volta)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Import/ripristino dati da un backup (scelta di scopo, vedi sopra)
- Modificare/archiviare un prodotto offline appena creato e non ancora sincronizzato (limite noto)
- Test end-to-end automatici in un vero browser (serve uno strumento tipo Playwright non
  disponibile in modo affidabile in questo ambiente di sviluppo)

## Debito tecnico
- Il filtro di stato (scorta bassa/esaurito) si applica dopo il fetch (max 500 risultati).
- URL firmate immagini scadono dopo 6 ore, rigenerate automaticamente ad ogni fetch.
- Il parser comandi vocali è a regole semplici: frasi italiane più elaborate di quelle
  d'esempio nel brief potrebbero non essere riconosciute e ricadere sulla ricerca semplice
  (comportamento sicuro, mai un'azione sbagliata, ma non "capisce tutto").

## Bug noti
Nessuno. Test automatici backend: 67/67 passati.

## Bug risolti
Vedi versioni precedenti di questo file per la cronologia completa (schermo nero, deploy
Cloudflare, variabili JWT, Backblaze ACL/bucket pubblico, endpoint B2, trust proxy, form
annidato scanner, cartella offline mancante dal deploy, creazione offline).
