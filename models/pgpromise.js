var pgp = require('pg-promise')(),
    config   = require('../config/app')

var pgDb = pgp(config.db.postgres.url)

module.exports = { pgDb, config }
