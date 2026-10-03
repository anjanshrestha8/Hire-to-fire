const Channel = require("../models/channel");
const Message = require("../models/messages");

exports.getMessagesByChannel = async (req, res) => {
  try {
    const messages = await Message.findAll({ where: {roomId: req.params.channel} });
    res.json(messages);
  } catch (err) {
    console.error("getMessagesByChannel error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { roomId, sender, content } = req.body;

    console.log(req.body);

    if (!roomId || !sender || !content) {
      return res
        .status(400)
        .json({ error: "room, sender and content are required" });
    }

    const channel = await Channel.findOne({ where: { id: roomId } });
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const message = await Message.create({
      roomId,
      sender,
      content,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("createMessage error:", err);
    res.status(500).json({ error: "Failed to create message" });
  }
};


exports.updateMessage = async (req, res) => {
  try {
    const [updated] = await Message.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (updated === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const updatedMessage = await Message.findByPk(req.params.id);
    res.json(updatedMessage);
  } catch (err) {
    console.error("updateMessage error:", err);
    res.status(500).json({ error: "Failed to update message" });
  }
};


exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await Message.destroy({ where: {id: req.params.id}});
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.status(204).end();
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
