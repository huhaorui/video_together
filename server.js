const express = require('express');
const app = express();
const http = require('http');

app.use(express.static('dist'));
app.use(express.json())

let map = {}

app.post("/send", (req, res) => {
    map[req.body.movie] = req.body
    res.json("OK")
});


app.post("/receive", (req, res) => {
    res.json(map[req.body.movie])
});

http.createServer(app).listen(7799);

