/**
 * 
 * 提供调用的api路由
 * 
 */
const express = require('express');
const request = require('request');
const config = require('config');
const host = config.get('Common.dbRESTHost');
const router = express.Router();
const _ = require('lodash');
const fs = require('fs');
router.get('/', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });
});


/**
 * 导入SJ
 */
router.post('/update', (req, res) => {
    // if (!req.body.COPNO || req.body.COPNO == '') {
    //     res.status(500).json({ err: "COPNO没有传输过来或者为空" });
    // } else {

    // }
});



/**
 * 释放SJ
 */
router.post('/free', (req, res) => {
    // var data = req.body;
    // data.EDI_NO = 'EDI17B000036078328';
    // data.pre_entry_id = 'EDI17B000036078328';
    // data.COP_NO = 'BG201711KWGQ003207';
    // data.username = 'WLD7';
    // data.agent_code = '3120980025';
    // sjservice.freeEDINO(data).then(result => {
    //     res.status(200).json(result);
    // }).catch(err => {
    //     res.status(200).json(err);
    // })
});



/**
 * 根据时间跑回当天的回执{username,agent_code,datetime}
 */
router.post('/getCustomresult', (req, res) => {
    // var data = req.body;
    // console.log(data.datetime);
    // sjservice.getCustomresult(data).then(result => {
    //     res.status(200).json(result);
    // }).catch(err => {
    //     console.log(err);
    //     res.status(500).json({ err });
    // })
});


module.exports.defualtrouter = router;