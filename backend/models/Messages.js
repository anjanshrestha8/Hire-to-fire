const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database/dbConn");
const Channel = require("./channel");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

Channel.hasMany(Message, { foreignKey: "roomId", as: "messages" });
Message.belongsTo(Channel, { foreignKey: "roomId", as: "channel" });

module.exports = Message;
