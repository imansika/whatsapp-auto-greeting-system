const db = require("../db");

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });

const listMessageLogs = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rows = await runQuery(
      `SELECT id, user_id, sender_number, message_text, direction, created_at
       FROM message_logs
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 500`,
      [userId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load message logs" });
  }
};

module.exports = { listMessageLogs };