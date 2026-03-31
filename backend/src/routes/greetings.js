const express = require("express");
const authenticateToken = require("../middleware/auth");
const {
  listGreetings,
  createGreeting,
  updateGreeting,
  updateGreetingStatus,
  deleteGreeting,
} = require("../controllers/greetings");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listGreetings);
router.post("/", createGreeting);
router.put("/:id", updateGreeting);
router.patch("/:id/status", updateGreetingStatus);
router.delete("/:id", deleteGreeting);

module.exports = router;