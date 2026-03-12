const express = require('express');
const QRCode = require('qrcode');
const db = require('../db');
const { getStatus } = require('../services/whatsappService');

const router = express.Router();

// Helper to read latest session row from DB
const getDbSession = () =>
  new Promise((resolve) => {
    db.query(
      `SELECT whatsapp_number, status, last_connected
       FROM whatsapp_sessions
       WHERE user_id = 1
       ORDER BY id DESC
       LIMIT 1`,
      (err, rows) => resolve(err || !rows.length ? null : rows[0]),
    );
  });

router.get('/status', async (req, res) => {
  try {
    const status = getStatus();

    // Read last known session from DB (whatsapp_number, last_connected)
    const dbSession = await getDbSession();

    const hasQr = Boolean(status.hasQr);
    const isConnected = Boolean(status.connected);
    const isConnecting = Boolean(status.isConnecting);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({
      connected: isConnected,
      isConnecting,
      hasQr,
      qrImage: hasQr ? status.qrImage : null,
      qrUrl: hasQr ? `/api/whatsapp/qr?v=${status.qrToken || 0}` : null,
      lastUpdated: status.lastUpdated,
      // DB-backed info
      whatsappNumber: dbSession?.whatsapp_number || null,
      lastConnected: dbSession?.last_connected || null,
      dbStatus: dbSession?.status || 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load WhatsApp QR status',
      error: error.message,
    });
  }
});

router.get('/qr', async (req, res) => {
  try {
    const status = getStatus();

    if (!status.qr) {
      return res.status(404).json({ message: 'QR not available' });
    }

    const qrBuffer = await QRCode.toBuffer(status.qr, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      type: 'png',
    });

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.type('png');
    return res.send(qrBuffer);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load WhatsApp QR image',
      error: error.message,
    });
  }
});

module.exports = router;
