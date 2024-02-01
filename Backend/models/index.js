const config = require("../config/config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(config.DATABASE, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
});

const db = {};
db.sequelize = sequelize;
db.models = {};
db.models.User = require("./user")(sequelize, Sequelize.DataTypes);

module.exports = db;
