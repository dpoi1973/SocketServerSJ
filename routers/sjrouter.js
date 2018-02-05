/**
 * 
 * 提供调用的api路由
 * 
 */
const express = require('express');
const request = require('request');
const config = require('config');
const host = config.get('Common.dbRESTHost');
const classifyservice = require('../services/ClassifyServices');
const huiyuService = require('../services/huiyuService');
const router = express.Router();
const _ = require('lodash');
const fs = require('fs');
router.get('/', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });
});


/**
 * 同步sql
 */
router.post('/updatemysql', (req, res) => {
    try {
        classifyservice.classify()
            .then(data => {
                console.log(data);
                res.json(data);
            })
            .catch(err => {
                console.log(err);
                res.json(err);
            })
    } catch (err) {
        console.log(err);
        res.json(err);
    }
});


router.get('/huiyu', (req, res) => {
    try {
        huiyuService.backhuiyu().then(data => {
            const rr = fs.createReadStream('huiyu.xlsx');
            res.set({
                "Content-type": "application/octet-stream",
                "Content-Disposition": "attachment;filename=" + encodeURI('huiyu.xlsx')
            });

            rr.on("data", (chunk) => res.write(chunk, "binary"));

            rr.on('end', function () {
                res.end();
            });
        })

    } catch (err) {
        res.json(err);
    }
})


module.exports.defualtrouter = router;