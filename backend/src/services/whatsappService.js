const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const db = require("../db");

const QRCode = require("qrcode");

const INIT_RETRY_DELAY_MS = 8000;
const AUTH_DATA_PATH = path.resolve(__dirname, "../../.wwebjs_auth");
const WHATSAPP_CLIENT_ID = process.env.WHATSAPP_CLIENT_ID || "main";
const SESSION_DIR = path.join(AUTH_DATA_PATH, `session-${WHATSAPP_CLIENT_ID}`);

let latestQr = null;
let latestQrText = null;
let qrToken = null;
let isReady = false;
let lastUpdated = null;
let isInitializing = false;
let retryTimeout = null;
let activeClient = null;

const killStaleChrome = () => {
  try {
    execSync(
      `powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -match 'wwebjs_auth' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`,
      { timeout: 10000, stdio: "pipe" },
    );
    console.log("[WhatsApp] Killed stale chrome processes (if any).");
  } catch (_) {}
};

const cleanupSessionLocks = () => {
  try {
    ["SingletonLock", "SingletonCookie", "SingletonSocket"].forEach((f) => {
      const p = path.join(SESSION_DIR, f);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { force: true });
        console.log(`[WhatsApp] Removed stale lock: ${f}`);
      }
    });
  } catch (err) {
    console.warn("[WhatsApp] Could not remove session locks:", err.message);
  }
};

const createClient = () => {
  const c = new Client({
    authStrategy: new LocalAuth({
      clientId: WHATSAPP_CLIENT_ID,
      dataPath: AUTH_DATA_PATH,
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    },
  });

  c.on("qr", async (qr) => {

  console.log("[WhatsApp] QR code ready - scan with your phone:");
  qrcode.generate(qr, { small: true });

  try {
    latestQrText = qr;
    latestQr = await QRCode.toDataURL(qr);
  } catch (err) {
    console.error("QR generation error:", err);
    latestQr = null;
  }

  isReady = false;
  isInitializing = true;   // IMPORTANT

  qrToken = Date.now();
  lastUpdated = new Date().toISOString();

  db.query(
    `UPDATE whatsapp_sessions SET status = 'disconnected' WHERE user_id = 1`
  );
});

  c.on("loading_screen", (percent, message) => {
    console.log(`[WhatsApp] Loading ${percent}% - ${message}`);
  });

  c.on("authenticated", () => {
    console.log("[WhatsApp] Authenticated - session saved for next start.");
    // QR has been successfully scanned; hide it and show connecting state
    latestQr = null;
    latestQrText = null;
    qrToken = null;
    isInitializing = true;
    isReady = false;
    lastUpdated = new Date().toISOString();
  });

  c.on("change_state", (state) => {
    // Keep status transitions event-driven and stable
    if (state === "CONNECTED") {
      isReady = true;
      isInitializing = false;
      latestQr = null;
      latestQrText = null;
      qrToken = null;
    } else if (state === "OPENING" || state === "PAIRING") {
      isReady = false;
      isInitializing = true;
    } else if (state === "UNPAIRED" || state === "UNPAIRED_IDLE") {
      isReady = false;
      isInitializing = false;
      latestQr = null;
      latestQrText = null;
      qrToken = null;
    }
    lastUpdated = new Date().toISOString();
  });

  c.on("ready", () => {
    console.log("[WhatsApp] Client is Ready!");

    isInitializing = false;
    isReady = true;
    latestQr = null;
    latestQrText = null;
    qrToken = null;
    lastUpdated = new Date().toISOString();

    try {
      const number = c.info.wid.user;
      console.log("[WhatsApp] Connected number:", number);

      // Upsert: update existing row or insert new one
      const upsertQuery = `
        INSERT INTO whatsapp_sessions (user_id, whatsapp_number, status, last_connected)
        VALUES (?, ?, 'connected', NOW())
        ON DUPLICATE KEY UPDATE
          whatsapp_number = VALUES(whatsapp_number),
          status = 'connected',
          last_connected = NOW()
      `;

      db.query(upsertQuery, [1, number], (err) => {
        if (err) {
          console.error("[DB] Upsert session error:", err.message);
        } else {
          console.log("[DB] WhatsApp session saved/updated for", number);
        }
      });
    } catch (err) {
      console.error("[WhatsApp] Could not read client info:", err.message);
    }
  });

  c.on("auth_failure", (msg) => {
    console.error("[WhatsApp] Auth failure:", msg);
    isInitializing = false;
    isReady = false;
    latestQr = null;
    latestQrText = null;
    qrToken = null;
    lastUpdated = new Date().toISOString();
    scheduleReinit();
  });

  c.on("disconnected", (reason) => {
    console.log("[WhatsApp] Disconnected:", reason);

    isInitializing = false;
    isReady = false;
    latestQr = null;
    latestQrText = null;
    qrToken = null;
    lastUpdated = new Date().toISOString();

    db.query(
      `UPDATE whatsapp_sessions SET status = 'disconnected' WHERE user_id = 1`,
      (err) => {
        if (err) {
          console.error("[DB] Update session error:", err.message);
        } else {
          console.log("[DB] Session marked as disconnected");
        }
      },
    );

    scheduleReinit();
  });

  return c;
};

const scheduleReinit = (delay = INIT_RETRY_DELAY_MS) => {
  if (retryTimeout) return;
  console.log(`[WhatsApp] Scheduling reinit in ${delay / 1000}s...`);
  retryTimeout = setTimeout(() => {
    retryTimeout = null;
    initializeClient();
  }, delay);
};

const initializeClient = async () => {
  if (isInitializing) return;
  isInitializing = true;

  if (activeClient) {
    try {
      await activeClient.destroy();
    } catch (_) {}
    activeClient = null;
  }

  killStaleChrome();
  cleanupSessionLocks();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    activeClient = createClient();
    await activeClient.initialize();
    // NOTE: isInitializing stays true here until 'ready' / 'auth_failure' / 'disconnected' fires
  } catch (error) {
    console.error("[WhatsApp] Initialization failed:", error.message);
    if (activeClient) {
      try {
        await activeClient.destroy();
      } catch (_) {}
      activeClient = null;
    }
    isInitializing = false;
    isReady = false;
    latestQr = null;
    latestQrText = null;
    qrToken = null;
    lastUpdated = new Date().toISOString();
    scheduleReinit();
  }
};

initializeClient();

const getStatus = () => {
  const hasQr = Boolean(latestQr);
  const connected = Boolean(isReady && !hasQr);
  const isConnectingNow = Boolean(isInitializing && !connected && !hasQr);

  return {
    connected,
    isConnecting: isConnectingNow,
    isInitializing,
    hasQr,
    qr: latestQrText,
    qrImage: latestQr,
    qrToken,
    lastUpdated,
    whatsappNumber: activeClient?.info?.wid?.user || null
  };
};

module.exports = { getStatus };
