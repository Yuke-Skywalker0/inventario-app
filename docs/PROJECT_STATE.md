# Project State

_Ultimo aggiornamento: fix deploy Cloudflare (package-lock.json fuori sincrono per Playwright)._

## Fase corrente
Bug di deploy risolto: avevo aggiunto `@playwright/test` a `package.json` senza rigenerare
`package-lock.json`, e Cloudflare usa `npm ci` (che pretende i due file sincronizzati) — il
build falliva prima ancora di iniziare. Rimosso `@playwright/test` dal `package.json` del
progetto (i test e2e restano nel repository, ma Playwright va installato a parte quando
serve — vedi `docs/E2E_TESTING.md`). Verificato con `npm ci` reale che ora funziona. 90/90
test backend, build frontend pulita.

## Nota importante: la sandbox di sviluppo si è resettata durante questa sessione
A un certo punto tutti i file sono spariti dall'ambiente di sviluppo (evento simile a un
riavvio). Sono stati ripristinati dall'ultimo zip consegnato e il lavoro di questa sessione
è stato rifatto da capo su quella base. Se qualcosa sembrasse "mancante" rispetto a quanto
descritto nelle risposte precedenti, verifica sempre con la checklist deploy in fondo a
questo file prima di dare per scontato un problema.

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini, bucket PRIVATO).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato in questa sessione
- [x] **Import/ripristino backup (Sezione 59)**: nel Profilo (solo admin/owner), "Importa
      backup (JSON)" — percorso inverso dell'export. Crea SEMPRE dati nuovi rimappando gli id
      del file (pensato per ripristinare uno spazio vuoto, non per un merge intelligente con
      dati esistenti — l'utente viene avvisato chiaramente prima di procedere, per evitare
      duplicati indesiderati). Transazione MongoDB: se qualcosa fallisce a metà, non resta
      nulla di parziale
- [x] **Modifica/archiviazione offline di prodotti non ancora sincronizzati**: estese
      `offlineAwareUpdate` e `offlineAwareToggleArchived` nello stesso file
      `offline/offlineActions.js` già usato per quantità/trasferimenti/creazione — stessa
      logica, stesso meccanismo di coda e rimappatura degli id temporanei
- [x] **Suite di test end-to-end (Playwright)**: `frontend/e2e/` — autenticazione,
      ubicazioni, prodotti (creazione con quantità, +1 rapido, scheda prodotto). **Onestamente
      segnalato**: non eseguibili nella sandbox di sviluppo (stesso blocco di rete già
      incontrato con MongoDB, stavolta sul dominio dei binari Chromium di Playwright) — scritti
      con cura sui selettori reali del codice ma mai verificati per davvero. Istruzioni
      complete in `docs/E2E_TESTING.md`
- [x] 90 test automatici backend (+9 per la validazione import rispetto alla sessione precedente)

## In corso
- [ ] Push del codice su GitHub → deploy automatico (checklist sotto)
- [ ] Test import: esporta un backup, prova a importarlo in uno spazio vuoto (es. un secondo
      account di prova), verifica i conteggi mostrati
- [ ] Test offline: modalità aereo → crea un prodotto → modifica un suo dettaglio (categoria,
      note) → disattiva modalità aereo → verifica che si sincronizzi
- [ ] Prova a eseguire `npm run test:e2e` sul tuo computer (serve `npx playwright install
      chromium` prima) e segnala se qualche test fallisce

## Checklist di verifica deploy (SEMPRE, prima di segnalare qualcosa come "mancante")
1. `ls frontend/src/offline/` → devono esserci 4 file (db.js, offlineActions.js, sync.js,
   useOfflineSync.js — estesi con nuove funzioni in questa sessione, non ne sono stati
   aggiunti di nuovi)
2. `git status` prima di commit → controlla che tutti i file nuovi siano elencati
3. Render → Events e Cloudflare → Deployments → l'orario dell'ultimo deploy deve essere recente

## Mancante
Nessuna voce nota rimasta dal brief originale o dalle richieste successive. Eventuali nuovi
bug emersi dall'uso reale vanno segnalati con i log (Render → Logs, e la console del browser
per errori frontend) per una diagnosi rapida, come fatto con successo più volte in questo
progetto.

## Debito tecnico
- L'import non fa merge intelligente: su uno spazio con dati già esistenti crea duplicati
  (comportamento dichiarato e avvisato in UI, non un bug).
- Il filtro di stato (scorta bassa/esaurito) si applica dopo il fetch (max 500 risultati).
- URL firmate immagini scadono dopo 6 ore, rigenerate automaticamente ad ogni fetch.
- Test e2e mai eseguiti realmente (vedi sopra) — potrebbero richiedere piccoli aggiustamenti
  al primo tentativo.
- Gli inviti non verificano che l'email di chi accetta corrisponda a quella invitata.

## Bug noti
Nessuno. Test automatici backend: 90/90 passati.

## Bug risolti
- **[Fase 10] "Il tuo ruolo" vuoto per gli utenti creati prima della Fase 10**: `/api/me` e
  `login` cercavano il workspace solo tramite `user.defaultWorkspaceId` (campo che non
  esisteva ancora quando questi utenti si erano registrati), senza il ripiego automatico che
  invece aveva `requireWorkspace` — da qui l'incoerenza (Team funzionava, "Il tuo ruolo" nel
  Profilo no). Risolto centralizzando la logica in `services/workspaceResolver.js`, usata
  ora da tutti e tre i punti, con auto-riparazione: al primo utilizzo dopo l'aggiornamento,
  il `defaultWorkspaceId` mancante viene dedotto e salvato in modo permanente, per ogni
  utente coinvolto, senza bisogno di uno script di migrazione manuale.
- **[Deploy] `npm ci` fallito per `package-lock.json` fuori sincrono**: aggiunta manuale di
  `@playwright/test` a `package.json` senza rigenerare il lock file. Risolto rimuovendo la
  dipendenza dal progetto (i test restano, Playwright si installa a parte quando serve).
Vedi le versioni precedenti di questo file (recuperabili dalla cronologia Git) per l'elenco
completo dei bug precedenti: schermo nero, deploy Cloudflare (root directory/wrangler.jsonc),
variabili JWT, Backblaze ACL/bucket pubblico, endpoint B2, trust proxy, form annidato scanner,
cartella offline mancante dal deploy, creazione offline.
