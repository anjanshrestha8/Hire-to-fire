const express = require("express");
const {
  getMessagesByChannel,
  createMessage,
  updateMessage,
  deleteMessage,
} = require("../controller/messages.controller");

const router = express.Router();

router.get("/:channel", getMessagesByChannel);
router.post("/", createMessage);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
