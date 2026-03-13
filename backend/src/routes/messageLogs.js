const express = require("express");
const authenticateToken = require("../middleware/auth");
const { listMessageLogs } = require("../controllers/messageLogs");

const router = express.Router();

router.use(authenticateToken);
router.get("/", listMessageLogs);

module.exports = router;