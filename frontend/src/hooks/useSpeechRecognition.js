import { useEffect, useRef, useState, useCallback } from 'react';

// Chrome desktop/Android la supporta bene. Safari ha un supporto parziale
// e incostante, Firefox non la supporta affatto: per questo il pulsante
// microfono viene mostrato SOLO se l'API è realmente disponibile
// (Sezione 20 e 25: mai fingere compatibilità universale, sempre un
// fallback manuale — qui il fallback è semplicemente scrivere a mano,
// che resta sempre possibile).
export function useSpeechRecognition({ onResult, lang = 'it-IT' } = {}) {
  const [supported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [supported, lang, onResult]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setListening(true);
    recognitionRef.current.start();
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, start, stop };
}
