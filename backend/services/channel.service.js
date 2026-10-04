const ServiceError = require("../utils/serviceError");
const Channel = require("../models/channel");

const channelService = {
  getChannels: async () => {
    return Channel.findAll({
      order: [["name", "ASC"]],
    });
  },

  createChannel: async ({ name }) => {
    if (!name) {
      throw new ServiceError(400, { error: "Missing name" });
    }

    return Channel.create({ name });
  },

  updateChannel: async (id, { name }) => {
    const [updated] = await Channel.update(
      { name },
      { where: { id }, returning: true }
    );

    if (!updated) {
      throw new ServiceError(404, { error: "Not found" });
    }

    return Channel.findByPk(id);
  },

  deleteChannel: async (id) => {
    const deleted = await Channel.destroy({ where: { id } });
    if (!deleted) {
      throw new ServiceError(404, { error: "Not found" });
    }

    return { deleted: true };
  },
};

module.exports = channelService;
