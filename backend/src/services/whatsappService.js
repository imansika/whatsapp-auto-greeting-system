const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const db = require("../db");

const QRCode = require("qrcode");

const INIT_RETRY_DELAY_MS = 8000;
const AUTH_DATA_PATH = path.resolve(__dirname, "../../.wwebjs_auth");
const userSessions = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getClientIdForUser = (userId) => `user-${Number(userId)}`;
const getSessionKeyForUser = (userId) => `session-${getClientIdForUser(userId)}`;
const getSessionDirForUser = (userId) =>
  path.join(AUTH_DATA_PATH, getSessionKeyForUser(userId));

const getUserSessionState = (userId) => {
  const normalizedUserId = Number(userId);
  if (!userSessions.has(normalizedUserId)) {
    userSessions.set(normalizedUserId, {
      latestQr: null,
      latestQrText: null,
      qrToken: null,
      isReady: false,
      lastUpdated: null,
      isInitializing: false,
      retryTimeout: null,
      activeClient: null,
    });
  }
  return userSessions.get(normalizedUserId);
};

const killStaleChrome = (userId) => {
  const sessionKey = getSessionKeyForUser(userId);
  try {
    execSync(
      `powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -match '${sessionKey}' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`,
      { timeout: 10000, stdio: "pipe" },
    );
    console.log(`[WhatsApp][User ${userId}] Killed stale chrome processes (if any).`);
  } catch (_) {}
};

const cleanupSessionLocks = (userId) => {
  const sessionDir = getSessionDirForUser(userId);
  try {
    ["SingletonLock", "SingletonCookie", "SingletonSocket"].forEach((f) => {
      const p = path.join(sessionDir, f);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { force: true });
        console.log(`[WhatsApp][User ${userId}] Removed stale lock: ${f}`);
      }
    });
  } catch (err) {
    console.warn(`[WhatsApp][User ${userId}] Could not remove session locks:`, err.message);
  }
};

const clearRetryReinit = (userId) => {
  const session = getUserSessionState(userId);
  if (session.retryTimeout) {
    clearTimeout(session.retryTimeout);
    session.retryTimeout = null;
  }
};

const removeAuthDataWithRetry = async (userId) => {
  const sessionDir = getSessionDirForUser(userId);
  if (!fs.existsSync(sessionDir)) return;

  let lastError = null;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      fs.rmSync(sessionDir, {
        recursive: true,
        force: true,
        maxRetries: 4,
        retryDelay: 250,
      });
      return;
    } catch (error) {
      lastError = error;
      const isBusy = error?.code === "EBUSY" || error?.code === "EPERM";
      if (!isBusy || attempt === 8) {
        throw error;
      }
      killStaleChrome(userId);
      await sleep(500 * attempt);
    }
  }

  if (lastError) {
    throw lastError;
  }
};

const createClient = (userId) => {
  const session = getUserSessionState(userId);
  const clientId = getClientIdForUser(userId);

  const c = new Client({
    authStrategy: new LocalAuth({
      clientId,
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
    console.log(`[WhatsApp][User ${userId}] QR code ready - scan with your phone:`);
    qrcode.generate(qr, { small: true });

    try {
      session.latestQrText = qr;
      session.latestQr = await QRCode.toDataURL(qr);
    } catch (err) {
      console.error(`[WhatsApp][User ${userId}] QR generation error:`, err);
      session.latestQr = null;
    }

    session.isReady = false;
    session.isInitializing = true;
    session.qrToken = Date.now();
    session.lastUpdated = new Date().toISOString();

    db.query(
      `UPDATE whatsapp_sessions SET status = 'disconnected' WHERE user_id = ?`,
      [userId],
    );
  });

  c.on("loading_screen", (percent, message) => {
    console.log(`[WhatsApp][User ${userId}] Loading ${percent}% - ${message}`);
  });

  c.on("authenticated", () => {
    console.log(`[WhatsApp][User ${userId}] Authenticated - session saved for next start.`);
    session.latestQr = null;
    session.latestQrText = null;
    session.qrToken = null;
    session.isInitializing = true;
    session.isReady = false;
    session.lastUpdated = new Date().toISOString();
  });

  c.on("change_state", (state) => {
    if (state === "CONNECTED") {
      session.isReady = true;
      session.isInitializing = false;
      session.latestQr = null;
      session.latestQrText = null;
      session.qrToken = null;
    } else if (state === "OPENING" || state === "PAIRING") {
      session.isReady = false;
      session.isInitializing = true;
    } else if (state === "UNPAIRED" || state === "UNPAIRED_IDLE") {
      session.isReady = false;
      session.isInitializing = false;
      session.latestQr = null;
      session.latestQrText = null;
      session.qrToken = null;
    }
    session.lastUpdated = new Date().toISOString();
  });

  c.on("ready", () => {
    console.log(`[WhatsApp][User ${userId}] Client is Ready!`);

    session.isInitializing = false;
    session.isReady = true;
    session.latestQr = null;
    session.latestQrText = null;
    session.qrToken = null;
    session.lastUpdated = new Date().toISOString();

    try {
      const number = c.info.wid.user;
      console.log(`[WhatsApp][User ${userId}] Connected number:`, number);

      const upsertQuery = `
        INSERT INTO whatsapp_sessions (user_id, whatsapp_number, status, last_connected)
        VALUES (?, ?, 'connected', NOW())
        ON DUPLICATE KEY UPDATE
          whatsapp_number = VALUES(whatsapp_number),
          status = 'connected',
          last_connected = NOW()
      `;

      db.query(upsertQuery, [userId, number], (err) => {
        if (err) {
          console.error(`[DB][User ${userId}] Upsert session error:`, err.message);
        } else {
          console.log(`[DB][User ${userId}] WhatsApp session saved/updated for`, number);
        }
      });
    } catch (err) {
      console.error(`[WhatsApp][User ${userId}] Could not read client info:`, err.message);
    }
  });

  c.on("auth_failure", (msg) => {
    console.error(`[WhatsApp][User ${userId}] Auth failure:`, msg);
    session.isInitializing = false;
    session.isReady = false;
    session.latestQr = null;
    session.latestQrText = null;
    session.qrToken = null;
    session.lastUpdated = new Date().toISOString();
    scheduleReinit(userId);
  });

  c.on("disconnected", (reason) => {
    console.log(`[WhatsApp][User ${userId}] Disconnected:`, reason);

    session.isInitializing = false;
    session.isReady = false;
    session.latestQr = null;
    session.latestQrText = null;
    session.qrToken = null;
    session.lastUpdated = new Date().toISOString();

    db.query(
      `UPDATE whatsapp_sessions SET status = 'disconnected' WHERE user_id = ?`,
      [userId],
      (err) => {
        if (err) {
          console.error(`[DB][User ${userId}] Update session error:`, err.message);
        } else {
          console.log(`[DB][User ${userId}] Session marked as disconnected`);
        }
      },
    );

    scheduleReinit(userId);
  });

  return c;
};

const scheduleReinit = (userId, delay = INIT_RETRY_DELAY_MS) => {
  const session = getUserSessionState(userId);
  if (session.retryTimeout) return;
  console.log(`[WhatsApp][User ${userId}] Scheduling reinit in ${delay / 1000}s...`);
  session.retryTimeout = setTimeout(() => {
    session.retryTimeout = null;
    initializeClient(userId);
  }, delay);
};

const initializeClient = async (userId) => {
  const session = getUserSessionState(userId);
  if (session.isInitializing) return;
  session.isInitializing = true;

  if (session.activeClient) {
    try {
      await session.activeClient.destroy();
    } catch (_) {}
    session.activeClient = null;
  }

  killStaleChrome(userId);
  cleanupSessionLocks(userId);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    session.activeClient = createClient(userId);
    await session.activeClient.initialize();
  } catch (error) {
    console.error(`[WhatsApp][User ${userId}] Initialization failed:`, error.message);
    if (session.activeClient) {
      try {
        await session.activeClient.destroy();
      } catch (_) {}
      session.activeClient = null;
    }
    session.isInitializing = false;
    session.isReady = false;
    session.latestQr = null;
    session.latestQrText = null;
    session.qrToken = null;
    session.lastUpdated = new Date().toISOString();
    scheduleReinit(userId);
  }
};

const logoutAndReinitialize = async (userId) => {
  const session = getUserSessionState(userId);
  clearRetryReinit(userId);

  if (session.activeClient) {
    try {
      await session.activeClient.destroy();
    } catch (_) {}
    session.activeClient = null;
  }

  session.isReady = false;
  session.isInitializing = false;
  session.latestQr = null;
  session.latestQrText = null;
  session.qrToken = null;
  session.lastUpdated = new Date().toISOString();

  killStaleChrome(userId);
  cleanupSessionLocks(userId);
  await sleep(1200);
  await removeAuthDataWithRetry(userId);

  await new Promise((resolve) => {
    db.query(
      `UPDATE whatsapp_sessions
       SET status = 'disconnected', whatsapp_number = NULL
       WHERE user_id = ?`,
      [userId],
      () => resolve(),
    );
  });

  await initializeClient(userId);
};

const getStatus = (userId) => {
  const session = getUserSessionState(userId);

  if (!session.activeClient && !session.isInitializing) {
    initializeClient(userId).catch((error) => {
      console.error(`[WhatsApp][User ${userId}] Lazy init failed:`, error.message);
    });
  }

  const hasQr = Boolean(session.latestQr);
  const connected = Boolean(session.isReady && !hasQr);
  const isConnectingNow = Boolean(session.isInitializing && !connected && !hasQr);

  return {
    connected,
    isConnecting: isConnectingNow,
    isInitializing: session.isInitializing,
    hasQr,
    qr: session.latestQrText,
    qrImage: session.latestQr,
    qrToken: session.qrToken,
    lastUpdated: session.lastUpdated,
    whatsappNumber: session.activeClient?.info?.wid?.user || null,
  };
};

module.exports = { getStatus, logoutAndReinitialize };
