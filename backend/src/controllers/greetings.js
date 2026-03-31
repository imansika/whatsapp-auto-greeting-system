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

const parseKeywords = (triggerWordValue) =>
  String(triggerWordValue || "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

const normalizeKeywords = (keywords) => {
  if (!Array.isArray(keywords)) return "";

  const uniqueKeywords = [...new Set(
    keywords
      .map((keyword) => String(keyword).trim().toLowerCase())
      .filter(Boolean),
  )];

  return uniqueKeywords.join(",");
};

const mapGreetingRow = (row) => ({
  id: row.id,
  title: row.title || "Greeting Message",
  message: row.reply_message || "",
  keywords: parseKeywords(row.trigger_keyword),
  enabled: Boolean(row.is_active),
  createdAt: row.created_at,
});

const findConflictingKeyword = async (userId, keywords, excludeGreetingId = null) => {
  if (!Array.isArray(keywords) || !keywords.length) {
    return null;
  }

  const normalizedSet = new Set(
    keywords
      .map((keyword) => String(keyword).trim().toLowerCase())
      .filter(Boolean),
  );

  if (!normalizedSet.size) {
    return null;
  }

  const params = [userId];
  let sql = `SELECT trigger_keyword
             FROM greeting_messages
             WHERE user_id = ?`;

  if (excludeGreetingId !== null) {
    sql += " AND id <> ?";
    params.push(excludeGreetingId);
  }

  const rows = await runQuery(sql, params);

  for (const row of rows) {
    const existingKeywords = parseKeywords(row.trigger_keyword).map((keyword) =>
      keyword.toLowerCase(),
    );

    const duplicate = existingKeywords.find((keyword) => normalizedSet.has(keyword));
    if (duplicate) {
      return duplicate;
    }
  }

  return null;
};

const isDuplicateKeywordError = (error) =>
  error?.code === "ER_DUP_ENTRY" &&
  String(error?.sqlMessage || "").includes("unique_user_trigger_keyword");

const getGreetingById = async (userId, greetingId) => {
  const rows = await runQuery(
    `SELECT id, title, trigger_keyword, reply_message, is_active, created_at
     FROM greeting_messages
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [greetingId, userId],
  );

  return rows.length ? mapGreetingRow(rows[0]) : null;
};

const validateGreetingPayload = ({ title, message }) => {
  if (!String(title || "").trim()) {
    return "Title is required";
  }

  if (!String(message || "").trim()) {
    return "Message is required";
  }

  return null;
};

const listGreetings = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const rows = await runQuery(
      `SELECT id, title, trigger_keyword, reply_message, is_active, created_at
       FROM greeting_messages
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [userId],
    );

    res.json(rows.map(mapGreetingRow));
  } catch (error) {
    res.status(500).json({ error: "Failed to load greeting messages" });
  }
};

const createGreeting = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { title, message, keywords = [], enabled = true } = req.body;

    const validationError = validateGreetingPayload({ title, message });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const conflictingKeyword = await findConflictingKeyword(userId, keywords);
    if (conflictingKeyword) {
      return res.status(409).json({
        error: `Trigger keyword '${conflictingKeyword}' already exists for this user`,
      });
    }

    const result = await runQuery(
      `INSERT INTO greeting_messages (user_id, title, trigger_keyword, reply_message, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        String(title).trim(),
        normalizeKeywords(keywords),
        String(message).trim(),
        Boolean(enabled),
      ],
    );

    const greeting = await getGreetingById(userId, result.insertId);
    return res.status(201).json(greeting);
  } catch (error) {
    if (isDuplicateKeywordError(error)) {
      return res.status(409).json({
        error: "Trigger keyword already exists for this user",
      });
    }

    return res.status(500).json({ error: "Failed to create greeting message" });
  }
};

const updateGreeting = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const greetingId = Number(req.params.id);
    const { title, message, keywords = [], enabled = true } = req.body;

    const validationError = validateGreetingPayload({ title, message });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const conflictingKeyword = await findConflictingKeyword(userId, keywords, greetingId);
    if (conflictingKeyword) {
      return res.status(409).json({
        error: `Trigger keyword '${conflictingKeyword}' already exists for this user`,
      });
    }

    const result = await runQuery(
      `UPDATE greeting_messages
       SET title = ?, trigger_keyword = ?, reply_message = ?, is_active = ?
       WHERE id = ? AND user_id = ?`,
      [
        String(title).trim(),
        normalizeKeywords(keywords),
        String(message).trim(),
        Boolean(enabled),
        greetingId,
        userId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Greeting message not found" });
    }

    const greeting = await getGreetingById(userId, greetingId);
    return res.json(greeting);
  } catch (error) {
    if (isDuplicateKeywordError(error)) {
      return res.status(409).json({
        error: "Trigger keyword already exists for this user",
      });
    }

    return res.status(500).json({ error: "Failed to update greeting message" });
  }
};

const updateGreetingStatus = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const greetingId = Number(req.params.id);
    const { enabled } = req.body;

    const result = await runQuery(
      `UPDATE greeting_messages
       SET is_active = ?
       WHERE id = ? AND user_id = ?`,
      [Boolean(enabled), greetingId, userId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Greeting message not found" });
    }

    const greeting = await getGreetingById(userId, greetingId);
    return res.json(greeting);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update greeting status" });
  }
};

const deleteGreeting = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const greetingId = Number(req.params.id);

    const result = await runQuery(
      `DELETE FROM greeting_messages
       WHERE id = ? AND user_id = ?`,
      [greetingId, userId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Greeting message not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete greeting message" });
  }
};

module.exports = {
  listGreetings,
  createGreeting,
  updateGreeting,
  updateGreetingStatus,
  deleteGreeting,
};