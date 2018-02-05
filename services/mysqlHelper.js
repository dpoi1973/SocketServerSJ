const Sequelize = require('sequelize');
// var sequelize = new Sequelize('database', 'username', 'password');
const sequelize = new Sequelize('mysql://parauser:@192.168.0.74:3306/paratmp');

module.exports = exports = function (sql) {

    return sequelize.query(sql, { type: sequelize.QueryTypes.SELECT, raw: true, });

}
