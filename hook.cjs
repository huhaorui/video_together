const express = require('express');
const app = express();
const http = require('http');

app.use(express.json())

let map = new Map()


app.post("/", (req, res) => {
    console.log(req.body.ref)
    if (req.body.ref.indexOf('master') >= 0) {
        console.log('触发WebHook')
        //逻辑处理
    }
    res.json('ok')
});

http.createServer(app).listen(7799, "::0");

