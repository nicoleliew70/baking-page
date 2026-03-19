require('dotenv').config({ path: '.env.local' });
const { importPKCS8, SignJWT } = require('jose');

async function test() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentialsJson) return console.log('No credentials');
  
  const credentials = JSON.parse(credentialsJson);
  const alg = 'RS256';
  const privateKey = await importPKCS8(credentials.private_key, alg);

  const jwt = await new SignJWT({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  if (!token) return console.log('No token', tokenData);

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return console.log('No spreadhseet ID');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A:A`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
