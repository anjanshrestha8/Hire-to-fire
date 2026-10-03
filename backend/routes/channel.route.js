const express = require("express");
const channelController = require("../controller/channel.controller");

function buildChannelRouter(io) {
  const router = express.Router();

  router.get("/", channelController.getChannels);
  router.post("/", channelController.createChannel(io));
  router.put("/:id", channelController.updateChannel(io));
  router.delete("/:id", channelController.deleteChannel(io));

  return router;
}

module.exports = buildChannelRouter;
