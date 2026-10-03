const Channel = require("../models/channel");

exports.getChannels = async (_req, res) => {
  try {
    const channels = await Channel.findAll({
      order: [["name", "ASC"]],
    });

    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch channels" });
  }
};

exports.createChannel = (io) => async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing name" });

    const channel = await Channel.create({ name });
    io.emit("channel:created", channel);
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ error: "Failed to create channel" });
  }
};

exports.updateChannel = (io) => async (req, res) => {
  try {
    const { name } = req.body || {};
    const [updated] = await Channel.update(
      { name },
      { where: { id: req.params.id }, returning: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });

    const channel = await Channel.findByPk(req.params.id);
    io.emit("channel:renamed", channel);
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: "Failed to update channel" });
  }
};

exports.deleteChannel = (io) => async (req, res) => {
  try {
    const deleted = await Channel.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Not found" });

    io.emit("channel:deleted", req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete channel" });
  }
};
