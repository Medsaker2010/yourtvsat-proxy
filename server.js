const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Sert les fichiers qui sont dans le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Le Proxy pour tester les abonnements
app.get('/api/proxy', async (req, res) => {
    const { host, port, user, pass } = req.query;
    const targetUrl = `${host}:${port}/player_api.php?username=${user}&password=${pass}`;

    try {
        const response = await axios.get(targetUrl);
        const userInfo = response.data.user_info;
        
        if (userInfo && userInfo.auth === 1) {
            // Calcule la date d'expiration si elle existe
            const expiry = userInfo.exp_date ? new Date(userInfo.exp_date * 1000).toLocaleDateString() : "Illimité";
            res.json({ auth: 1, expiry: expiry });
        } else {
            res.json({ auth: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: "Serveur IPTV injoignable" });
    }
});

module.exports = app;
