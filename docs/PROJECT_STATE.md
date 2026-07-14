# Project State

_Ultimo aggiornamento: Fase 21 (Offline reale) + fix form annidato scanner._

## ⚠️ Nota importante per l'utente
Hai segnalato che "Da comprare" e i filtri di ricerca non funzionano, come se le modifiche
precedenti non fossero state prese. **Sono già stati costruiti** (Fase 16: filtri di ricerca,
Fase 18: lista della spesa manuale) — il problema è quasi certamente che è stata pushata una
versione precedente del codice per errore. Vedi la checklist di verifica in fondo a questo
file prima di aprire una segnalazione per una funzione "mancante": controlla prima che il
deploy corrisponda davvero all'ultimo zip.

## Fase corrente
Fase 21 (Offline reale) completata. Trovato e corretto anche un bug reale preesistente: lo
scanner barcode era annidato dentro il tag `<form>` del prodotto (HTML non permette form
dentro form) — causava probabilmente il crash/logout segnalato quando si confermava un
codice inserito a mano. 60/60 test backend, build frontend pulita (326 moduli, scanner in
chunk separato di 480KB caricato solo on-demand).

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini, bucket PRIVATO).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Fase 6-8, 11, 12/13/14, 15, 16, 17, 18, 19, 20: vedi cronologia Git
- [x] Fix immagini (bucket privato + URL firmate), "Ricordami" al login
- [x] **Fase 21: Offline reale**
      - IndexedDB (`offline/db.js`): cache locale prodotti/ubicazioni + coda operazioni
      - Lettura offline: ricerca, filtri, dettaglio prodotto funzionano da cache quando manca
        la rete (Sezione 25)
      - Scrittura offline: modifica quantità e trasferimenti applicano il delta in locale
        (stessa logica del server, verificata con test manuale: sottrazione, nuova
        ubicazione, quantità insufficiente, immutabilità) e mettono l'operazione in coda
      - Sincronizzazione automatica al ritorno della connessione, con badge che mostra
        "offline" / "sincronizzazione in corso" / "N modifiche in attesa"
      - **Scope dichiarato**: creare NUOVI prodotti/ubicazioni richiede connessione (il brief
        stesso dice "se possibile" per questo caso — la complessità di riconciliare ID
        temporanei non era giustificata per l'MVP). Funziona invece tutto il resto:
        aggiornare quantità e trasferire su prodotti/ubicazioni già esistenti, il caso d'uso
        principale del brief ("sono in cantiere, prendo 2 pezzi, non ho rete")
      - Protezione aggiunta durante lo sviluppo: la sincronizzazione non scarta mai
        un'operazione valida per un 401 temporaneo (token scaduto proprio in quel momento) —
        solo per un vero errore applicativo (es. scorta finita nel frattempo)
- [x] **Fix bug: scanner annidato dentro il form prodotto** — corretto spostandolo a fratello
      invece che figlio del tag `<form>`

## In corso — azioni utente richieste
- [ ] Push del codice su GitHub → deploy automatico
- [ ] **Verifica deploy** (vedi checklist sotto) prima di segnalare altre funzioni "mancanti"
- [ ] Test offline reale: attiva la modalità aereo, prova a modificare una quantità, disattiva
      la modalità aereo, verifica che si sincronizzi da sola (guarda il badge in alto)
- [ ] Riprova lo scanner con inserimento manuale del codice — non dovrebbe più chiudere l'app

## Checklist di verifica deploy (da usare quando qualcosa "non c'è")
1. Su GitHub, apri il file `frontend/src/pages/ShoppingList.jsx` nel browser: se NON contiene
   la parola `AddToShoppingListForm`, il push non è andato a buon fine — ripeti `git push`.
2. Su Render → Events: controlla che l'ultimo deploy sia recente (pochi minuti fa, non giorni).
3. Su Cloudflare → il progetto → Deployments: stesso controllo.
4. Se i tempi non tornano, il modo più sicuro è: cancella la cartella locale del progetto,
   riestrai l'ultimo zip da zero (non sovrascrivere una cartella vecchia), rifai `git add . && git commit && git push`.

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Comandi vocali completi (es. "togli 2 raccordi da 20")
- Cronologia movimenti leggibile in UI (i dati esistono già nel DB)
- Creazione prodotti/ubicazioni offline (scope escluso dalla Fase 21, vedi sopra)

## Debito tecnico
- Il filtro di stato (scorta bassa/esaurito) si applica dopo il fetch (max 500 risultati).
- URL firmate immagini scadono dopo 6 ore, rigenerate automaticamente ad ogni fetch.
- Cronologia movimenti esiste nel DB ma non ha ancora una schermata dedicata.
- La cache offline dei prodotti si popola solo con ciò che è stato effettivamente visto
  online almeno una volta (Sezione 25 lo prevede implicitamente: non si può lavorare offline
  su dati mai scaricati). Se apri l'app per la prima volta già offline, la lista sarà vuota.

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
- **[Fase 19] Scanner barcode annidato dentro `<form>` nel form prodotto**: HTML non
  permette form dentro form: il browser normalizza la struttura in modo imprevedibile,
  probabile causa del crash/logout segnalato confermando un codice inserito a mano. Risolto
  spostando lo scanner fuori dal tag form (fratello, non figlio).
