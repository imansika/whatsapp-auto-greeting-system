// controllers/whatsappLogout.js

const { logoutAndReinitialize } = require("../services/whatsappService");

const logoutWhatsApp = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await logoutAndReinitialize(userId);

    res.json({
      success: true,
      message: "WhatsApp session reset successfully. New QR is being generated.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
};

module.exports = { logoutWhatsApp };