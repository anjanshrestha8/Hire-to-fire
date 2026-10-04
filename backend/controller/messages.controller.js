const ServiceError = require("../utils/serviceError");
const messagesService = require("../services/messages.service");

exports.getMessagesByChannel = async (req, res) => {
  try {
    const messages = await messagesService.getMessagesByChannel(
      req.params.channel
    );
    res.json(messages);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    console.error("getMessagesByChannel error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    console.log(req.body);
    const message = await messagesService.createMessage(req.body);
    res.status(201).json(message);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    console.error("createMessage error:", err);
    res.status(500).json({ error: "Failed to create message" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const updatedMessage = await messagesService.updateMessage(
      req.params.id,
      req.body
    );
    res.json(updatedMessage);
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    console.error("updateMessage error:", err);
    res.status(500).json({ error: "Failed to update message" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await messagesService.deleteMessage(req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json(err.body);
    }
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
