const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/proxy', async (req, res) => {
    const { host, port, user, pass } = req.query;
    const targetUrl = `${host}:${port}/player_api.php?username=${user}&password=${pass}`;
    try {
        const response = await axios.get(targetUrl);
        res.json(response.data.user_info || { auth: 0 });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur IPTV" });
    }
});

module.exports = app;
