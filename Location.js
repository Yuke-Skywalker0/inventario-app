const { S3Client } = require('@aws-sdk/client-s3');

// Backblaze B2 espone un'API compatibile S3. L'endpoint e la region
// vanno copiati dai dettagli del bucket sulla dashboard Backblaze
// (sezione "Endpoint"), es. endpoint: https://s3.us-west-004.backblazeb2.com,
// region: us-west-004. Vedi docs/ENV_VARS.md.
function createB2Client() {
  const endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION;
  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;

  if (!endpoint || !region || !keyId || !applicationKey) {
    return null;
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

function publicUrlFor(key) {
  if (!key) return null;
  const endpoint = process.env.B2_ENDPOINT;
  const bucket = process.env.B2_BUCKET_NAME;
  if (!endpoint || !bucket) return null;
  return `${endpoint}/${bucket}/${key}`;
}

module.exports = { createB2Client, publicUrlFor };
