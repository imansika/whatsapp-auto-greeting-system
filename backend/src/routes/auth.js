const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;
const RESET_GENERIC_MESSAGE = 'If an account exists for that email, a reset token has been sent.';

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendPasswordResetTokenEmail = async (toEmail, token) => {
  const transporter = getSmtpTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !from) {
    throw new Error('SMTP is not configured');
  }

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: 'Your password reset token',
    text: `Use this reset token to change your password: ${token}\n\nThis token expires in ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes. If you did not request this, ignore this email.`,
  });
};

/**
 * REGISTER
 */
router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, phone, password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [username, email, phone, hashedPassword], (err, result) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Generate JWT token for auto-login
      const token = jwt.sign(
        { id: result.insertId, username: username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertId,
          username: username,
          email: email,
          phone: phone
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * LOGIN
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  });
});

/**
 * REQUEST PASSWORD RESET TOKEN
 */
router.post('/forgot-password/request', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const findUserSql = `SELECT id, email FROM users WHERE email = ? LIMIT 1`;

  db.query(findUserSql, [normalizedEmail], (findErr, rows) => {
    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }

    if (!rows.length) {
      return res.json({ message: RESET_GENERIC_MESSAGE });
    }

    const userId = rows[0].id;
    const userEmail = rows[0].email;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);

    const cleanupSql = `DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at < NOW() OR is_used = 1`;
    db.query(cleanupSql, [userId], (cleanupErr) => {
      if (cleanupErr) {
        return res.status(500).json({ error: cleanupErr.message });
      }

      const insertSql = `
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
      `;

      db.query(insertSql, [userId, tokenHash, PASSWORD_RESET_TOKEN_TTL_MINUTES], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }

        sendPasswordResetTokenEmail(userEmail, rawToken)
          .then(() => {
            return res.json({ message: RESET_GENERIC_MESSAGE });
          })
          .catch((mailErr) => {
            const removeSql = 'DELETE FROM password_reset_tokens WHERE token_hash = ?';
            db.query(removeSql, [tokenHash], () => {
              console.error('Password reset email send failed:', mailErr.message);
              return res.status(500).json({
                error: 'Unable to send reset email right now. Please try again later.',
              });
            });
          });
      });
    });
  });
});

/**
 * RESET PASSWORD USING TOKEN
 */
router.post('/forgot-password/reset', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const tokenHash = hashResetToken(token);
    const findTokenSql = `
      SELECT id, user_id
      FROM password_reset_tokens
      WHERE token_hash = ?
        AND is_used = 0
        AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
    `;

    db.query(findTokenSql, [tokenHash], async (findErr, rows) => {
      if (findErr) {
        return res.status(500).json({ error: findErr.message });
      }

      if (!rows.length) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const { id: tokenId, user_id: userId } = rows[0];
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePasswordSql = `UPDATE users SET password = ? WHERE id = ?`;
      db.query(updatePasswordSql, [hashedPassword, userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }

        const consumeTokenSql = `UPDATE password_reset_tokens SET is_used = 1 WHERE id = ?`;
        db.query(consumeTokenSql, [tokenId], (consumeErr) => {
          if (consumeErr) {
            return res.status(500).json({ error: consumeErr.message });
          }

          return res.json({ message: 'Password reset successful. You can now sign in.' });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;