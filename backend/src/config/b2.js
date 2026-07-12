const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Backblaze B2 espone un'API compatibile S3. L'endpoint e la region
// vanno copiati dai dettagli del bucket sulla dashboard Backblaze
// (sezione "Endpoint"), es. endpoint: https://s3.us-west-004.backblazeb2.com,
// region: us-west-004. Vedi docs/ENV_VARS.md.
function createB2Client() {
  let endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION;
  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;

  if (!endpoint || !region || !keyId || !applicationKey) {
    return null;
  }

  // Errore comune: incollare l'endpoint senza lo schema (es.
  // "s3.eu-central-003.backblazeb2.com" invece di "https://...").
  if (!/^https?:\/\//i.test(endpoint)) {
    endpoint = `https://${endpoint}`;
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: applicationKey
    }
  });
}

// Il bucket è PRIVATO (Backblaze richiede una carta di credito per
// abilitare bucket pubblici, anche se l'addebito è minimo — vedi ADL).
// Per mostrare le immagini generiamo quindi un URL firmato a scadenza,
// valido solo per qualche ora: nessuna carta, nessun costo, e in più le
// immagini non sono permanentemente accessibili da chiunque abbia il link.
const SIGNED_URL_EXPIRY_SECONDS = 6 * 60 * 60; // 6 ore

async function getSignedImageUrl(key) {
  if (!key) return null;
  const b2 = createB2Client();
  if (!b2) return null;

  try {
    const command = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: key });
    return await getSignedUrl(b2, command, { expiresIn: SIGNED_URL_EXPIRY_SECONDS });
  } catch (err) {
    console.error('[b2] impossibile generare URL firmata:', err.message);
    return null;
  }
}

module.exports = { createB2Client, getSignedImageUrl };
