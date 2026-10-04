const ServiceError = require("../utils/serviceError");
const channelService = require("../services/channel.service");

exports.getChannels = async (_req, res) => {
  try {
    const channels = await channelService.getChannels();
    res.json(channels);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    res.status(500).json({ error: "Failed to fetch channels" });
  }
};

exports.createChannel = (io) => async (req, res) => {
  try {
    const channel = await channelService.createChannel(req.body || {});
    io.emit("channel:created", channel);
    res.status(201).json(channel);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    res.status(500).json({ error: "Failed to create channel" });
  }
};

exports.updateChannel = (io) => async (req, res) => {
  try {
    const channel = await channelService.updateChannel(req.params.id, req.body || {});
    io.emit("channel:renamed", channel);
    res.json(channel);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    res.status(500).json({ error: "Failed to update channel" });
  }
};

exports.deleteChannel = (io) => async (req, res) => {
  try {
    await channelService.deleteChannel(req.params.id);
    io.emit("channel:deleted", req.params.id);
    res.sendStatus(204);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    res.status(500).json({ error: "Failed to delete channel" });
  }
};
