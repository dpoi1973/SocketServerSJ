const async = require('async');
const _ = require('lodash');
const Client = require('mysql').createConnection({
    host: '192.168.0.74',
    user: 'wanli',
    password: '123456789',
    database: 'qqautodb',
    charset: 'UTF8',
});
const exclserver = require('./exclService');
const fs = require('fs')
const sql = require('mssql');

const config = {
    user: 'poweruser',
    password: 'system',
    server: '192.168.0.132', // You can use 'localhost\\instance' to connect to named instance 
    database: 'classifyTestPL'
}

function getclassinfo2(callback) {
    sql.connect(config).then(() => {
        return sql.query`SELECT * FROM dbo.tbl_Custgoods where custid = 'CA503C70-41BA-45A6-B0B6-CB09B46C42F2'`
    }).then(result => {
        callback(result.recordsets[0])
        sql.close();
    })
        .catch(err => {
            console.log(err);
        })
}

module.exports.backhuiyu = function () {
    return new Promise((resolve, reject) => {
        getclassinfo2(datas => {
            console.log(datas.length);
            async.each(datas, function (data, callback) {
                if (data.Cspec) {
                    console.log(data.Cspec)
                    let ll = data.Cspec.replace('|无GTIN|无CAS', '').split('|');
                    ll = shuffle(ll);
                    let kk = '';
                    for (var i = 0; i < ll.length; i++) {
                        kk += ll[i];
                    }
                    data.Cspec = kk + '无GTIN无CAS';//substring(0,kk.length-1)
                    callback(null, data);
                } else {
                    callback(null, data)
                }
            }, function (err, results) {
                if (err) {
                    console.error(err)
                } else {
                    var colums = [
                        { header: 'SKU', key: 'Key1' },
                        { header: 'GoodsnameEN', key: 'GoodsnameEN' },
                        { header: 'GoodsclassEN', key: 'GoodsclassEN' },
                        { header: 'MaterialEN', key: 'MaterialEN' },
                        { header: 'MaterialkeyEN', key: 'MaterialkeyEN' },
                        { header: 'SpecEN', key: 'SpecEN' },
                        { header: 'GoodsnameCN', key: 'GoodsnameCN' },
                        { header: 'CspecCN', key: 'CspecCN' },
                        { header: 'HScode', key: 'HScode' },
                        { header: 'Memo', key: 'Memo' },
                        { header: 'Cgoodsname', key: 'Cgoodsname' },
                        { header: 'Cspec', key: 'Cspec' }
                    ];
                    var filename = 'huiyu.xlsx';
                    exclserver.xls(colums, datas, filename, function (result) {
                        console.log(result)
                        resolve(result);
                    })
                }
            })
        })
    })
}


function shuffle(array) {
    var tmp, current, top = array.length;
    if (top) while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
}

