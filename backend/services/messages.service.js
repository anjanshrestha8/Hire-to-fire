const ServiceError = require("../utils/serviceError");
const Channel = require("../models/channel");
const Message = require("../models/messages");

const messagesService = {
  getMessagesByChannel: async (channelId) => {
    return Message.findAll({ where: { roomId: channelId } });
  },

  createMessage: async ({ roomId, sender, content }) => {
    if (!roomId || !sender || !content) {
      throw new ServiceError(400, {
        error: "room, sender and content are required",
      });
    }

    const channel = await Channel.findOne({ where: { id: roomId } });
    if (!channel) {
      throw new ServiceError(404, { error: "Channel not found" });
    }

    return Message.create({
      roomId,
      sender,
      content,
    });
  },

  updateMessage: async (id, body) => {
    const [updated] = await Message.update(body, {
      where: { id },
      returning: true,
    });

    if (updated === 0) {
      throw new ServiceError(404, { error: "Message not found" });
    }

    return Message.findByPk(id);
  },

  deleteMessage: async (id) => {
    const deleted = await Message.destroy({ where: { id } });
    if (!deleted) {
      throw new ServiceError(404, { error: "Message not found" });
    }

    return { deleted: true };
  },
};

module.exports = messagesService;
