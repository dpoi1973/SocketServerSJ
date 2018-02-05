const mysqlHerper = require('./mysqlHelper');
const redisHelper = require('./redisHelper');

const redisconnstr = 'redis://:@192.168.0.16:6379/1';
// const redisconnstr = 'redis://:CodeflagRedis2017@139.196.81.167:6379/1';

const SJServer = require('./ShangJianService');
const fs = require('fs');
const _ = require('lodash')
const async = require('async')

let sjserver = new SJServer('132mssql');

const obj = JSON.parse(fs.readFileSync('config/sqlmaps.json', 'utf8'));

redisHelper.open(redisconnstr);

const Client = require('mysql').createConnection({
    host: '192.168.0.74',
    user: 'parauser',
    password: '',
    database: 'paratmp',
    charset: 'UTF8',
});

let complex = [];
let Classify_New = [];
module.exports.classify = function () {
    return new Promise((resolve, reject) => {
        sjserver.querySql('132mssql', `select * from complex`, [])
            .then(complexresult => {
                console.log('complex ', complexresult.recordset.length);
                complex = complexresult.recordset;
                return sjserver.querySql('132mssql', `select * from Classify_New`, []);
            })
            .then(Classify_Newresult => {
                console.log('Classify_New ', Classify_Newresult.recordset.length);
                Classify_New = Classify_Newresult.recordset;
                let paraData = trans(Classify_New, complex);
                console.log(paraData.length);
                paraData = _.chunk(paraData,3000);
                async.mapSeries(paraData, function(paradata,callback){
                    mysqlInsert(paradata)
                    .then(result => {
                        console.log(result)
                        callback(null,result)
                    })
                    .catch(err => {
                        console.log(err);
                        callback(err)
                    })
                },function(err,resu){
                    if(err){
                        reject(err)
                    }else{
                        redisback();
                        resolve(resu);
                    }
                })
                // return mysqlInsert(paraData);
            })
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            })
    })
}



function trans(Classify_New, complex) {
    try {
        console.log(Classify_New.length, complex.length)
        let dd = [];
        let cc = 0;
        for (let i = 0; i < Classify_New.length; i++) {
            let pp = {};
            for (let j = 0; j < complex.length; j++) {
                if (Classify_New[i].HSCode.toString().replace(/\s/g,'') == (complex[j].CODE_T + ((complex[j].CODE_S != null) ? complex[j].CODE_S : ''))) {
                    pp.HSCode = Classify_New[i].HSCode.toString().replace(/\s/g,'');
                    pp.GName = complex[j].G_NAME;
                    pp.LowRate = complex[j].LOW_RATE;
                    pp.HighRate = complex[j].HIGH_RATE;
                    pp.OutRate = complex[j].OUT_RATE;
                    pp.RegRate = complex[j].REG_RATE;
                    pp.TaxType = complex[j].TAX_TYPE;
                    pp.TaxRate = complex[j].TAX_RATE;
                    pp.CommRate = complex[j].COMM_RATE;
                    pp.TaiwanRate = complex[j].TAIWAN_RAT;
                    pp.OtherType = complex[j].OTHER_TYPE;
                    pp.OtherRate = complex[j].OTHER_RATE;
                    pp.Unit1 = complex[j].UNIT_1;
                    pp.Unit2 = complex[j].UNIT_2;
                    pp.ControlMark = complex[j].CONTROL_MA;
                    pp.TarifFlag = complex[j].TARIF_MARK;
                    pp.NoteS = complex[j].NOTE_S;
                    pp.ChouchaFlag = 0;
                    pp.ChouchaValidDate = null;
                    pp.TmpTax = 0;
                    pp.ClassifyName = Classify_New[i].ClassifyName;
                    pp.R1 = Classify_New[i].R1;
                    pp.R2 = Classify_New[i].R2;
                    pp.RList = Classify_New[i].RList;
                    pp.namestruct = null;
                    pp.Cspec = null;
                    pp.createdAt = null;
                    pp.updatedAt = null;
                    pp.hscodeVersion = null;
                    if (pp.HSCode.length < 10) {
                        pp.HSCode = pp.HSCode + '00';
                    }
                    let count = 1;
                    let gg = [];
                    let qq = '';
                    for (let k = 1; k < 21; k++) {
                        const ll = {};
                        if (Classify_New[i][`要素${k}`]) {
                            ll.id = count;
                            ll.name = Classify_New[i][`要素${k}`];
                            const lpl = '[\(\)]|\[.*?$';
                            let kk = Classify_New[i][`要素${k}`].replace(/\[\(\)]|\[.*?$/g, '').replace('(', '').replace(')', '');
                            qq += `${kk}|`;
                            count++;
                            if (Classify_New[i][`可选${k}`]) {
                                ll.option = Classify_New[i][`可选${k}`];
                            }
                            if (Classify_New[i][`说明${k}`]) {
                                ll.desc = Classify_New[i][`说明${k}`];
                            }
                            if (ll.id) {
                                gg.push(ll);
                            }
                        }
                    }
                    // gg = JSON.stringify(gg).replace('\\',"");
                    pp.R2Distinct = qq.substring(0, qq.length - 1);
                    pp.TempJson = gg;
                }
            }
            if (pp.HSCode) {
                dd.push(pp);
                console.log('cc   ',cc++);
            }
        }
        // setTimeout(() => {
            fs.writeFileSync('ok.json',JSON.stringify(dd));
            return dd;
        // }, 100)
    } catch (err) {
        console.log(err);
        return (err);
    }
}



function mysqlInsert(paraData) {
    // console.log('paraData', paraData.length)
    return new Promise((resolve, reject) => {
        const Sequelize = require('sequelize');
        // const sequelize = new Sequelize('mysql://parauser:@192.168.0.74:3306/paratmp');// qqautodb  ('mysql://wanli:123456789@192.168.0.74:3306/qqautodb');/
        const sequelize = new Sequelize('mysql://wanli:123456789@192.168.0.74:3306/qqautodb');
        const tablecul = paraData[0];
        const temp = {};
        for (const key in tablecul) {
            if (key == 'HSCode') {
                temp[key] = { type: Sequelize.STRING, primaryKey: true };
            } else if (key == 'ChouchaFlag' || key == 'TmpTax') {
                temp[key] = { type: Sequelize.INTEGER(11) };
            } else if (key == 'TempJson' || key == 'R1' || key == 'R2' || key == 'RList') {
                temp[key] = { type: Sequelize.JSON };
            } else if (key == 'R2Distinct') {
                temp[key] = { type: Sequelize.STRING(300) };
            } else {
                temp[key] = { type: Sequelize.STRING };
            }
        }
        const table = sequelize.define('classifyinfo', temp,
            {
                timestamps: false,
                tableName: 'classifyinfo',
                freezeTableName: true,
            });
        table.sync({ force: false }).then(() => {
            table
                .bulkCreate(paraData).then((data) => {
                    console.log('has been success');
                    // redisback();
                    resolve('has been success');
                });
        });
    })
}



function redisback() {
    async.mapSeries(obj, (ob, callback) => {
        mysqlHerper(ob.sql)
            .then((data) => {
                // console.log(data);
                // 拼成
                redisHelper.pipelineput(ob.tablename, data, (err, result) => {
                    console.log(result);
                    callback(null, result);
                });
            })
            .catch((err) => {
                console.error(err);
                callback(err);
            });
    });
}



module.exports.mysqlin = function (paraData) {
    // console.log('paraData', paraData.length)
    return new Promise((resolve, reject) => {
        const Sequelize = require('sequelize');
        // const sequelize = new Sequelize('mysql://parauser:@192.168.0.74:3306/paratmp');// qqautodb  ('mysql://wanli:123456789@192.168.0.74:3306/qqautodb');/
        const sequelize = new Sequelize('mysql://wanli:123456789@192.168.0.74:3306/qqautodb');
        const tablecul = paraData[0];
        const temp = {};
        for (const key in tablecul) {
            if (key == 'HSCode') {
                temp[key] = { type: Sequelize.STRING, primaryKey: true };
            } else if (key == 'ChouchaFlag' || key == 'TmpTax') {
                temp[key] = { type: Sequelize.INTEGER(11) };
            } else if (key == 'TempJson' || key == 'R1' || key == 'R2' || key == 'RList') {
                temp[key] = { type: Sequelize.JSON };
            } else if (key == 'R2Distinct') {
                temp[key] = { type: Sequelize.STRING(300) };
            } else {
                temp[key] = { type: Sequelize.STRING };
            }
        }
        const table = sequelize.define('classifyinfo', temp,
            {
                timestamps: false,
                tableName: 'classifyinfo',
                freezeTableName: true,
            });
        table.sync({ force: false }).then(() => {
            table
                .bulkCreate(paraData).then((data) => {
                    console.log('has been success');
                    // redisback();
                    resolve('has been success');
                });
        });
    })
}