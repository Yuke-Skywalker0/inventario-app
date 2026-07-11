// Ridimensiona e comprime un'immagine nel browser prima dell'upload,
// per rispettare lo storage gratuito limitato (Sezione 22) e velocizzare
// il caricamento su reti lente (Sezione 25/27). Rimuove anche i dati
// EXIF, dato che ridisegnare l'immagine su un canvas non li copia.
export function compressImage(file, { maxDimension = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Impossibile elaborare questa immagine'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossibile leggere questa immagine'));
    };

    img.src = objectUrl;
  });
}
