const async = require('async');
const Redis = require('ioredis');
// var redis = null; // 32774, '192.168.77.161',);

let redisconnstr = '';

exports.deleteKey = (name, cb) => {
  const redis = new Redis(redisconnstr);
  redis.del(name, (err, result) => {
    cb(err, result);
  });
};

exports.pipeget = (commands, cb) => {
  const redis = new Redis(redisconnstr);
  const pipeline = redis.pipeline();
  commands.forEach((command) => {
    pipeline.hget(command.hname, command.keyname);
  });

  pipeline.exec((err, results) => {
    if (err) {
      // console.error(err);
      cb(err);
    } else {
      // console.log(results);
      cb(null, results);
    }
    // `err` is always null, and `results` is an array of responses
    // corresponding to the sequence of queued commands.
    // Each response follows the format `[err, result]`.
  });
};

exports.pipelineput = (hkeyname, datas, cb) => {
  const redis = new Redis(redisconnstr);
  const pipeline = redis.pipeline();

  datas.forEach((v) => {
    pipeline.hset(hkeyname, [v.ID, v.disValue]);
  });

  pipeline.exec((err, results) => {
    if (err) {
      // console.error(err);
      cb(err);
    } else {
      // console.log(results);
      cb(null, results);
    }
    // `err` is always null, and `results` is an array of responses
    // corresponding to the sequence of queued commands.
    // Each response follows the format `[err, result]`.
  });
};
exports.mhputMap = (hkeyname, datas, cb) => {
  const redis = new Redis(redisconnstr);
  const m = new Map();
  datas.forEach((v) => {
    m.set(v.ID, v.disValue);
  });
  redis.hmset(hkeyname, m)
  .then((dd) => {
    cb(null, dd);
  })
  .catch((err) => {
    cb(err);
  });
};


exports.open = (connstr) => {
  redisconnstr = connstr;
  // redis= new Redis(connstr);// 'redis://:@192.168.0.16:6379/1');
};

exports.mhput = (hkeyname, datas, cb) => {
  const redis = new Redis(redisconnstr);
  const result = [];
  async.forEach(datas, (v, callback) => {
    redis.hmset(hkeyname, [v.ID, v.disValue])
    .then((okr) => {
      result.push(okr);
      callback();
    })
    .catch((e) => {
      callback(e);
    });
  }, (err) => {
    cb(err, result);
  });
};
