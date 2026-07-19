// Sezione 20: "Non utilizzare AI in questa versione". Riconoscimento a
// regole: un verbo noto in testa alla frase, seguito da una quantità
// (cifra o parola numerica) e dal nome del prodotto. Qualsiasi cosa non
// rientri in questo schema preciso ricade sulla ricerca semplice — mai
// un'azione a metà o indovinata.
const NUMBER_WORDS = {
  un: 1,
  uno: 1,
  una: 1,
  due: 2,
  tre: 3,
  quattro: 4,
  cinque: 5,
  sei: 6,
  sette: 7,
  otto: 8,
  nove: 9,
  dieci: 10,
  undici: 11,
  dodici: 12,
  tredici: 13,
  quattordici: 14,
  quindici: 15,
  sedici: 16,
  diciassette: 17,
  diciotto: 18,
  diciannove: 19,
  venti: 20
};

const REMOVE_VERBS = ['togli', 'rimuovi', 'leva', 'scarica'];
const ADD_VERBS = ['aggiungi', 'metti', 'carica'];
const SEARCH_VERBS = ['cerca', 'mostrami', 'trova', 'dove'];
const STOPWORDS_AFTER_QUANTITY = ['di', 'del', 'della', 'dei', 'delle', "dell'", "d'"];
const LOW_STOCK_PHRASES = [
  'cosa sta finendo',
  'cosa sta per finire',
  'cosa manca',
  'scorta bassa',
  'scorte basse',
  'cosa devo comprare'
];

export function parseVoiceCommand(rawText) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  // Caso speciale esplicito nel brief: "Mostrami cosa sta finendo" non è
  // una ricerca testuale, è una richiesta di filtro scorta bassa.
  if (LOW_STOCK_PHRASES.some((phrase) => lower.includes(phrase))) {
    return { action: 'filter-low' };
  }

  const originalWords = text.split(/\s+/).filter(Boolean);
  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { action: 'search', query: text };
  }

  const firstWord = words[0];

  if (REMOVE_VERBS.includes(firstWord) || ADD_VERBS.includes(firstWord)) {
    const action = REMOVE_VERBS.includes(firstWord) ? 'remove' : 'add';
    let rest = words.slice(1);

    let quantity = null;
    if (rest.length > 0) {
      const first = rest[0];
      if (/^\d+([.,]\d+)?$/.test(first)) {
        quantity = Number(first.replace(',', '.'));
        rest = rest.slice(1);
      } else if (NUMBER_WORDS[first] !== undefined) {
        quantity = NUMBER_WORDS[first];
        rest = rest.slice(1);
      }
    }

    while (rest.length > 0 && STOPWORDS_AFTER_QUANTITY.includes(rest[0])) {
      rest = rest.slice(1);
    }

    const query = rest.join(' ').trim();

    // Comando incompleto (manca quantità o nome prodotto): non
    // indoviniamo, ricade sulla ricerca semplice del testo originale.
    if (quantity === null || !query) {
      return { action: 'search', query: text };
    }

    return { action, quantity, query };
  }

  // Ricerca semplice: se la frase inizia con un verbo di ricerca
  // ("cerca", "mostrami"...) lo togliamo, altrimenti il termine
  // cercato non troverebbe mai corrispondenza in nessun campo.
  const searchWords = SEARCH_VERBS.includes(firstWord) ? originalWords.slice(1) : originalWords;
  const query = searchWords.join(' ').trim();

  return { action: 'search', query: query || text };
}
