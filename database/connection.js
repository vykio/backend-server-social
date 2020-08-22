const monk = require("monk");

const db = monk(process.env.MONGO_URI || 'localhost/socialme');

module.exports = db;