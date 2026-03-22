<?php
/* ══════════════════════════════════════════════════════════════════
   MOTEUR BACKEND YOURTVSAT (INDISPENSABLE POUR RAILWAY)
   Ce bloc permet de réaliser les vrais tests de latence (Ping)
   ══════════════════════════════════════════════════════════════════ */
if (isset($_GET['action']) && $_GET['action'] === 'ping') {
    header('Content-Type: application/json');
    $host = $_GET['host'] ?? 'api-connect.icu';
    $t0 = microtime(true);
    $fp = @fsockopen($host, 80, $errno, $errstr, 1.5);
    $t1 = microtime(true);
    if ($fp) {
        fclose($fp);
        echo json_encode(['status' => 'ok', 'ms' => round(($t1 - $t0) * 1000)]);
    } else {
        echo json_encode(['status' => 'err']);
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>YOURTVSAT VIP — Admin</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>
/* ══════════════════════════════════════
   DESIGN DE LUXE (TON STYLE MOBILE)
   ══════════════════════════════════════ */
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:#07070C;color:#E8E8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;min-height:100vh}
.header{background:#0E0E18;border-bottom:1px solid rgba(201,168,76,.2);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.header-logo{font-size:14px;font-weight:600;letter-spacing:.15em;color:#F5D87A;text-transform:uppercase}
.mode-badge{font-size:11px;padding:4px 10px;border-radius:4px;font-weight:600;color:#F0C040;background:rgba(240,192,64,.15)}

.card{background:#0E0E18;border:1px solid rgba(255,255,255,.05);border-radius:12px;margin:16px;padding:20px}
.card-title{font-size:12px;font-weight:600;color:#C9A84C;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}

/* PING DISPLAY */
.ping-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ping-item{background:#141420;padding:15px;border-radius:10px;text-align:center;border:1px solid rgba(255,255,255,.03)}
.ping-dns{font-size:10px;opacity:.5;display:block;margin-bottom:5px}
.ping-ms{font-size:20px;font-weight:700;color:#F5D87A}
.ping-status{font-size:9px;text-transform:uppercase;margin-top:5px;font-weight:bold}

/* BOUTONS LUXE */
.btn-gold{width:100%;padding:16px;background:#C9A84C;color:#000;border:none;border-radius:8px;font-weight:700;margin-top:10px;cursor:pointer}
.btn-gold:active{transform:scale(.98)}

#qrcode{background:#fff;padding:12px;display:inline-block;border-radius:8px;margin-top:15px}
.m3u-box{font-family:monospace;font-size:10px;color:#C9A84C;background:#000;padding:10px;border-radius:6px;word-break:break-all;margin-top:10px}
</style>
</head>
<body>

<div class="header">
    <div class="header-logo">YOURTVSAT VIP</div>
    <div class="mode-badge" id="mode-status">SATELLITE ACTIF</div>
</div>

<div class="card">
    <div class="card-title">Diagnostic Temps Réel</div>
    <div class="ping-grid">
        <div class="ping-item">
            <span class="ping-dns">STRONG 8K</span>
            <div class="ping-ms" id="p-1">--</div>
            <div class="ping-status" id="s-1" style="color:#aaa">STANDBY</div>
        </div>
        <div class="ping-item">
            <span class="ping-dns">NEO 4K PRO</span>
            <div class="ping-ms" id="p-2">--</div>
            <div class="ping-status" id="s-2" style="color:#aaa">STANDBY</div>
        </div>
    </div>
    <button class="btn-gold" onclick="runGlobalPing()">RESCANNER LES FLUX</button>
</div>

<div class="card">
    <div class="card-title">Générateur d'Accès</div>
    <select id="srv" style="width:100%;padding:12px;background:#000;color:#fff;border:1px solid #C9A84C;border-radius:8px">
        <option value="my8k.me">Strong 8K Premium</option>
        <option value="neo4kpro.me">Neo 4K Pro</option>
        <option value="api-connect.icu">Nexon 4K VIP</option>
    </select>
    <button class="btn-gold" style="background:#fff" onclick="generateVIP()">ACTIVER LE QR CODE</button>
    
    <center>
        <div id="qr-container" style="display:none">
            <div id="qrcode"></div>
            <div class="m3u-box" id="m3u-link"></div>
        </div>
    </center>
</div>

<script>
/* ══════════════════════════════════════
   LOGIQUE JAVASCRIPT CONNECTÉE AU PHP
   ══════════════════════════════════════ */

async function checkServer(host, id) {
    const pEl = document.getElementById('p-'+id);
    const sEl = document.getElementById('s-'+id);
    pEl.innerText = '...';
    
    try {
        // On appelle la fonction PHP définie en haut du fichier
        const response = await fetch('?action=ping&host=' + host);
        const data = await response.json();
        
        if(data.status === 'ok') {
            pEl.innerText = data.ms + 'ms';
            pEl.style.color = '#22CC66';
            sEl.innerText = 'OPTIMAL';
            sEl.style.color = '#22CC66';
        } else {
            pEl.innerText = 'OFF';
            pEl.style.color = '#EE4444';
            sEl.innerText = 'TIMEOUT';
            sEl.style.color = '#EE4444';
        }
    } catch(e) {
        pEl.innerText = 'ERR';
    }
}

function runGlobalPing() {
    checkServer('my8k.me', '1');
    checkServer('neo4kpro.me', '2');
}

function generateVIP() {
    const srv = document.getElementById('srv').value;
    const user = "VIP_" + Math.floor(Math.random()*89999 + 10000);
    const pass = "SAT_" + Math.floor(Math.random()*8999 + 1000);
    const link = `http://${srv}:8080/get.php?username=${user}&password=${pass}&type=m3u_plus`;
    
    document.getElementById('qr-container').style.display = 'block';
    document.getElementById('m3u-link').innerText = link;
    
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, { text: link, width: 180, height: 180 });
}

// Lancement automatique
window.onload = runGlobalPing;
</script>

</body>
</html>
