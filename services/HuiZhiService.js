const SJServer = require('./ShangJianService');
const SendServer = require('./SendService');
const transdate = require('../common/transdateutil');
const async = require('async');
const fs = require('fs');

let sendserver = new SendServer('');
let sjserver = new SJServer('new207');

module.exports.starthuizhi = function (host, Oper_Time) {
    let finadata = {};
    return new Promise((resolve, reject) => {//Dcl_B_Response
        sjserver.querySql(host, 'SELECT TOP 30 * FROM dbo.Dcl_B_Response where Oper_Time >= @Oper_Time order by Oper_Time asc', { Oper_Time: Oper_Time })
            .then(results => {
                finadata.resp = results.recordset;
                sjserver.querySql(host, 'SELECT * FROM dbo.Dcl_B_Io_Decl where Ent_Decl_No in (SELECT TOP 30 Ent_Decl_No FROM dbo.Dcl_B_Response where Oper_Time >= @Oper_Time order by Oper_Time asc)', { Oper_Time: Oper_Time })
                    .then(results => {
                        let data = results.recordset;
                        async.mapSeries(data, function (dec, callback) {
                            sjserver.querySql(host, 'SELECT  * FROM dbo.Dcl_B_Io_Decl_Goods where Decl_Id = @Decl_Id', { Decl_Id: dec.Decl_Id })
                                .then(results => {
                                    let goodslist = [];
                                    if (results.recordset.length > 0) {
                                        goodslist = results.recordset;
                                    }
                                    dec.goodslist = goodslist;
                                    sjserver.querySql(host, 'SELECT  * FROM dbo.Dcl_B_Io_Decl_Cont where Decl_Id = @Decl_Id', { Decl_Id: dec.Decl_Id })
                                        .then(results => {
                                            let contlist = [];
                                            if (results.recordset.length > 0) {
                                                contlist = results.recordset;
                                            }
                                            dec.contlist = contlist;
                                            callback(null, dec);
                                        })
                                        .catch(err => {
                                            callback(err);
                                        })
                                })
                                .catch(err => {
                                    callback(err);
                                })
                        }, (err, results) => {
                            if (err)
                                reject(err);
                            finadata.decl = results;
                            if (finadata.resp.length > 0) {
                                sendserver.postsjresult(finadata, fn => {
                                    if (fn.status == 'Error') {
                                        reject(fn);
                                    } else {
                                        let data = finadata.resp;
                                        console.log(data[data.length - 1].Oper_Time.toISOString().slice(0,19).replace('T', ' '));
                                        let opertime = data[data.length - 1].Oper_Time.toISOString().slice(0,19).replace('T', ' ');
                                        if (data.length == 30) {
                                            fs.writeFileSync(`records/${host}.json`, JSON.stringify({ user: host, Oper_Time: opertime }));
                                            resolve({ status: 'continue', user: host, Oper_Time: opertime });
                                        } else {
                                            fs.writeFileSync(`records/${host}.json`, JSON.stringify({ user: host, Oper_Time: opertime }));
                                            resolve({ status: 'ok', user: host, Oper_Time: opertime });
                                        }
                                    }
                                })
                            } else {
                                resolve({ status: 'ok', user: host, Oper_Time: Oper_Time });
                            }
                        })
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    })
}