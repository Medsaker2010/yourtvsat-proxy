const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const NEXON_API_URL = process.env.NEXON_API_URL || 'http://api-connect.icu/api/dev_api.php';
const NEXON_API_KEY = process.env.NEXON_API_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-me';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key !== ADMIN_SECRET) {
    return res.status(403).json({ status: false, error: 'Access denied' });
  }
  next();
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'YOURTVSAT VIP Proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    nexon_configured: !!NEXON_API_KEY
  });
});

app.post('/api/create-test', requireAdmin, async (req, res) => {
  const email = req.body.email || '';
  const note = req.body.note || ('test_' + Date.now());
  if (!NEXON_API_KEY) {
    return res.status(500).json({ status: false, error: 'NEXON_API_KEY not set on server' });
  }
  const params = new URLSearchParams({
    action: 'user', type: 'create', package_id: '1',
    note: note, country: 'FR', api_key: NEXON_API_KEY
  });
  try {
    var t0 = Date.now();
    var response = await fetch(NEXON_API_URL + '?' + params.toString());
    var latency = Date.now() - t0;
    var data = await response.json();
    var result = Array.isArray(data) ? data[0] : data;
    if (result.status === true || result.status === 'true') {
      var m3u = result.url || buildM3U(result.dns, result.port, result.username, result.password);
      return res.json({ status: true, message: 'Test 24h created', latency: latency, username: result.username, password: result.password, dns: result.dns, port: result.port, url: m3u, expires_in: '24 hours', created_at: new Date().toISOString() });
    } else {
      return res.status(400).json({ status: false, error: result.message || 'Nexon API error', raw: result });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

app.post('/api/create-subscription', requireAdmin, async (req, res) => {
  var package_id = req.body.package_id || '2';
  var note = req.body.note || ('sub_' + Date.now());
  var country = req.body.country || 'FR';
  if (!NEXON_API_KEY) return res.status(500).json({ status: false, error: 'NEXON_API_KEY not set' });
  var validPackages = { '1': '24H', '2': '1 Month', '3': '3 Months', '4': '6 Months', '5': '12 Months', '6': '24 Months' };
  if (!validPackages[package_id]) return res.status(400).json({ status: false, error: 'Invalid package_id' });
  var params = new URLSearchParams({ action: 'user', type: 'create', package_id: package_id, note: note, country: country, api_key: NEXON_API_KEY });
  try {
    var t0 = Date.now();
    var response = await fetch(NEXON_API_URL + '?' + params.toString());
    var latency = Date.now() - t0;
    var data = await response.json();
    var result = Array.isArray(data) ? data[0] : data;
    if (result.status === true || result.status === 'true') {
      var m3u = result.url || buildM3U(result.dns, result.port, result.username, result.password);
      return res.json({ status: true, message: 'Subscription created: ' + validPackages[package_id], latency: latency, package: validPackages[package_id], username: result.username, password: result.password, dns: result.dns, port: result.port, url: m3u, xtream_url: 'http://' + result.dns + ':' + result.port + '/player_api.php?username=' + result.username + '&password=' + result.password, portal_url: 'http://' + result.dns + ':' + result.port + '/c', created_at: new Date().toISOString() });
    } else {
      return res.status(400).json({ status: false, error: result.message || 'Nexon API error', raw: result });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

app.get('/api/reseller-info', requireAdmin, async (req, res) => {
  if (!NEXON_API_KEY) return res.status(500).json({ status: false, error: 'API KEY missing' });
  var params = new URLSearchParams({ action: 'reseller', type: 'info', api_key: NEXON_API_KEY });
  try {
    var response = await fetch(NEXON_API_URL + '?' + params.toString());
    var data = await response.json();
    return res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) { return res.status(500).json({ status: false, error: err.message }); }
});

app.get('/api/packages', requireAdmin, async (req, res) => {
  if (!NEXON_API_KEY) return res.status(500).json({ status: false, error: 'API KEY missing' });
  var params = new URLSearchParams({ action: 'packages', type: 'list', api_key: NEXON_API_KEY });
  try {
    var response = await fetch(NEXON_API_URL + '?' + params.toString());
    var data = await response.json();
    return res.json({ status: true, packages: Array.isArray(data) ? data : [data] });
  } catch (err) { return res.status(500).json({ status: false, error: err.message }); }
});

app.post('/api/extend', requireAdmin, async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var package_id = req.body.package_id;
  if (!username || !password || !package_id) return res.status(400).json({ status: false, error: 'username, password and package_id required' });
  var params = new URLSearchParams({ action: 'user', type: 'extend', username: username, password: password, package_id: package_id, api_key: NEXON_API_KEY });
  try {
    var response = await fetch(NEXON_API_URL + '?' + params.toString());
    var data = await response.json();
    return res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) { return res.status(500).json({ status: false, error: err.message }); }
});

function buildM3U(dns, port, username, password) {
  return 'http://' + dns + ':' + port + '/get.php?username=' + username + '&password=' + password + '&type=m3u_plus&output=ts';
}

app.listen(PORT, function() {
  console.log('YOURTVSAT VIP Proxy started on port ' + PORT);
  console.log('NEXON API KEY: ' + (NEXON_API_KEY ? 'OK' : 'MISSING'));
  console.log('Health: http://localhost:' + PORT + '/health');
});
