// Test API connection
const https = require('https');
const { EXERCISEDB_API_KEY, HOST } = require('./apiConfig');

const options = {
  hostname: HOST,
  path: '/exercises?limit=2',
  method: 'GET',
  headers: {
    'x-rapidapi-key': EXERCISEDB_API_KEY,
    'x-rapidapi-host': HOST,
    'accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
