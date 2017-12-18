/**
 *sqserver Model
 **/
const mssql = require("mssql");
const config = require('config');

function SJServer(host) {
  this.confex = config.get(host);
}

// var restoreDefaults = function (conf) {
//   conf;
// };
var getConnection = function (host, callback) {//连接数据库
  if (!callback) {
    callback = function () { };
  }
  var conf = config.get(host);
  var con = new mssql.ConnectionPool({
    user: conf.user,
    password: conf.password,
    server: conf.server,
    database: conf.database,
    port: conf.port,
    pool: conf.pool
  }, function (err) {
    if (err) {
      throw err;
    }
    callback(con);
  });
}
SJServer.prototype.querySql = function (host, sql, params) {//写sql语句自由查询  params
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      if (params != "") {
        for (var index in params) {
          if (typeof params[index] == "number") {
            ps.input(index, mssql.Int);
          } else if (typeof params[index] == "string") {
            ps.input(index, mssql.NVarChar);
          }
        }
      }
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute(params, function (err, recordset) {
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};


SJServer.prototype.select = function (host, tableName, topNumber, whereSql, params, orderSql) {//查询该表所有符合条件的数据并可以指定前几个
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      var sql = "select * from " + tableName + " ";
      if (topNumber != "") {
        sql = "select top(" + topNumber + ") * from " + tableName + " ";
      }
      sql += whereSql + " ";
      if (params != "") {
        for (var index in params) {
          if (typeof params[index] == "number") {
            ps.input(index, mssql.Int);
          } else if (typeof params[index] == "string") {
            ps.input(index, mssql.NVarChar);
          }
        }
      }
      sql += orderSql;
      console.log(sql);
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute(params, function (err, recordset) {
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};

SJServer.prototype.selectAll = function (host, tableName) {//查询该表所有数据
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      var sql = "select * from " + tableName + " ";
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute("", function (err, recordset) {
          callBack(err, recordset);
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};

SJServer.prototype.add = function (host, addObj, tableName) {//添加数据
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      var sql = "insert into " + tableName + "(";
      if (addObj != "") {
        for (var index in addObj) {
          if (typeof addObj[index] == "number") {
            ps.input(index, mssql.Int);
          } else if (typeof addObj[index] == "string") {
            ps.input(index, mssql.NVarChar);
          }
          sql += index + ",";
        }
        sql = sql.substring(0, sql.length - 1) + ") values(";
        for (var index in addObj) {
          if (typeof addObj[index] == "number") {
            sql += addObj[index] + ",";
          } else if (typeof addObj[index] == "string") {
            sql += "'" + addObj[index] + "'" + ",";
          }
        }
      }
      sql = sql.substring(0, sql.length - 1) + ")";
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute(addObj, function (err, recordset) {
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};

SJServer.prototype.update = function (host, updateObj, whereObj, tableName) {//更新数据
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      var sql = "update " + tableName + " set ";
      if (updateObj != "") {
        for (var index in updateObj) {
          if (typeof updateObj[index] == "number") {
            ps.input(index, mssql.Int);
            sql += index + "=" + updateObj[index] + ",";
          } else if (typeof updateObj[index] == "string") {
            ps.input(index, mssql.NVarChar);
            sql += index + "=" + "'" + updateObj[index] + "'" + ",";
          }
        }
      }
      sql = sql.substring(0, sql.length - 1) + " where ";
      if (whereObj != "") {
        for (var index in whereObj) {
          if (typeof whereObj[index] == "number") {
            ps.input(index, mssql.Int);
            sql += index + "=" + whereObj[index] + " and ";
          } else if (typeof whereObj[index] == "string") {
            ps.input(index, mssql.NVarChar);
            sql += index + "=" + "'" + whereObj[index] + "'" + " and ";
          }
        }
      }
      sql = sql.substring(0, sql.length - 5);
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute(updateObj, function (err, recordset) {
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};

SJServer.prototype.del = function (host, whereSql, params, tableName) {//删除数据
  return new Promise((resolve, reject) => {
    getConnection(host, function (connection) {
      var ps = new mssql.PreparedStatement(connection);
      var sql = "delete from " + tableName + " ";
      if (params != "") {
        for (var index in params) {
          if (typeof params[index] == "number") {
            ps.input(index, mssql.Int);
          } else if (typeof params[index] == "string") {
            ps.input(index, mssql.NVarChar);
          }
        }
      }
      sql += whereSql;
      ps.prepare(sql, function (err) {
        if (err)
          reject(err);
        ps.execute(params, function (err, recordset) {
          if (err)
            reject(err);
          ps.unprepare(function (err) {
            if (err)
              reject(err);
            resolve(recordset);
          });
        });
      });
    });
  })
};


module.exports = exports = SJServer;