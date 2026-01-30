// Test API connection
const https = require('https');

const options = {
  hostname: 'exercisedb.p.rapidapi.com',
  path: '/exercises?limit=2',
  method: 'GET',
  headers: {
    'x-rapidapi-key': '44fd4a9fecmsh502ff3c161ed2e0p1d49c5jsn9443a4b4b98a',
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
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
