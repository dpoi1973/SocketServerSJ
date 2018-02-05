const config = require('config');
const fs = require('fs');
const schedule = require("node-schedule");
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');
const async = require('async');
const port = process.env.PORT || 8007;

const sjrouter = require('./routers/sjrouter');
const hzserver = require('./services/HuiZhiService');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

server.listen(port);

app.engine('jade', require('jade').__express);

app.get('/', (req, res) => {
  res.render('indexx.jade');
});

app.use('/api', sjrouter.defualtrouter);
const ioedis = io.of('/shangjianclients');

ioedis.on('connection', (socket) => {
    console.log('connected')
})

let new207configfile = JSON.parse(fs.readFileSync("records/new207.json", 'utf-8'));
let new207date = new207configfile.Oper_Time;
let newPVGconfigfile = JSON.parse(fs.readFileSync("records/newPVG.json", 'utf-8'));
let newPVGdate = newPVGconfigfile.Oper_Time;
let newPVG2configfile = JSON.parse(fs.readFileSync("records/newPVG2.json", 'utf-8'));
let newPVG2date = newPVG2configfile.Oper_Time;
let newKWEconfigfile = JSON.parse(fs.readFileSync("records/newKWE.json", 'utf-8'));
let newKWEdate = newKWEconfigfile.Oper_Time;


var rule2 = new schedule.RecurrenceRule();
var times2 = [1, 11, 21, 31, 41, 51];
rule2.minute = times2;
schedule.scheduleJob(rule2, function () {
    new207start('new207', new207date);
    newPVGstart('newPVG', newPVGdate);
    newPVG2start('newPVG2', newPVG2date);
    newKWEstart('newKWE', newKWEdate);
});


// new207start('new207', new207date);
// newPVGstart('newPVG', newPVGdate);
// newPVG2start('newPVG2', newPVG2date);
// newKWEstart('newKWE', newKWEdate);


function new207start(host, Oper_Time) {
    console.log(host, '回执接收开始！', Oper_Time);
    hzserver.starthuizhi(host, Oper_Time)
        .then(result => {
            new207date = result.Oper_Time;
            if (result.status == 'continue') {
                console.log(result.user, '回执接收继续！', result.Oper_Time);
                new207start(result.user, result.Oper_Time);
            } else {
                console.log(result.user, '回执接收结束！');
            }
        })
        .catch(err => {
            console.error(host, err);
            new207date = Oper_Time;
        });
}

function newPVGstart(host, Oper_Time) {
    console.log(host, '回执接收开始！', Oper_Time);
    hzserver.starthuizhi(host, Oper_Time)
        .then(result => {
            newPVGdate = result.Oper_Time;
            if (result.status == 'continue') {
                console.log(result.user, '回执接收继续！', result.Oper_Time);
                newPVGstart(result.user, result.Oper_Time);
            } else {
                console.log(result.user, '回执接收结束！');
            }
        })
        .catch(err => {
            console.error(host, err);
            newPVGdate = Oper_Time;
        });
}

function newPVG2start(host, Oper_Time) {
    console.log(host, '回执接收开始！', Oper_Time);
    hzserver.starthuizhi(host, Oper_Time)
        .then(result => {
            newPVG2date = result.Oper_Time;
            if (result.status == 'continue') {
                console.log(result.user, '回执接收继续！', result.Oper_Time);
                newPVG2start(result.user, result.Oper_Time);
            } else {
                console.log(result.user, '回执接收结束！');
            }
        })
        .catch(err => {
            console.error(host, err);
            newPVG2date = Oper_Time;
        });
}


function newKWEstart(host, Oper_Time) {
    console.log(host, '回执接收开始！', Oper_Time);
    hzserver.starthuizhi(host, Oper_Time)
        .then(result => {
            newKWEdate = result.Oper_Time;
            if (result.status == 'continue') {
                console.log(result.user, '回执接收继续！', result.Oper_Time);
                newKWEstart(result.user, result.Oper_Time);
            } else {
                console.log(result.user, '回执接收结束！');
            }
        })
        .catch(err => {
            console.error(host, err);
            newKWEdate = Oper_Time;
        });
}