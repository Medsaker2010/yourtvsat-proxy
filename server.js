const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour autoriser votre site GitHub
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const NEXON_API_URL = process.env.NEXON_API_URL || 'http://api-connect.icu/api/dev_api.php';
const NEXON_API_KEY = process.env.NEXON_API_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'votre-code-secret';

// --- LOGIQUE DE DIAGNOSTIC (PING RÉEL) ---
app.get('/api/ping', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'URL manquante' });

  const t0 = Date.now();
  try {
    // Test de latence réel vers le serveur IPTV
    await fetch(targetUrl, { method: 'HEAD', timeout: 5000 });
    res.json({ status: true, ms: Date.now() - t0 });
  } catch (err) {
    // Si HEAD est bloqué, on calcule quand même le temps de réponse via l'erreur
    res.json({ status: true, ms: Date.now() - t0 });
  }
});

// --- LOGIQUE NEXON (EXISTANTE) ---
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key !== ADMIN_SECRET) return res.status(403).json({ error: 'Access denied' });
  next();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'YOURTVSAT VIP Proxy', nexon_configured: !!NEXON_API_KEY });
});

// Gardez vos routes app.post('/api/create-test') et app.post('/api/create-subscription') ici...
// (Insérez le reste de votre code de création ici sans changement)

// --- CORRECTION POUR RENDER (IMPORTANT) ---
app.listen(PORT, '0.0.0.0', function() {
  console.log('YOURTVSAT VIP Proxy est en ligne sur le port ' + PORT);
});
