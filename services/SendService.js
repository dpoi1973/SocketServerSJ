/**
 * 发送队列service
 * 
 */

var i = 0;
var fs = require('fs');
const MQService = require('./RabbitService');
const config = require('config');
const sjresultqName = config.get('Common.SJResultQ');// 'edicustomsResults';
const sjheadqName = config.get('Common.SJHeadQ');
const mqservice = new MQService(sjresultqName);

function SendService() {
}

SendService.prototype.postsjresult = (data, fn) => {
    mqservice.sendToQueue(data.resp, sjresultqName)
        .then((ok) => {
            return mqservice.sendToQueue(data.decl, sjheadqName);
        })
        .then((ok) => {
            fn({ status: 'OK' });
        })
        .catch((err) => {
            fn({ status: 'Error', err });
        });

    return this;
};

module.exports = exports = SendService;
