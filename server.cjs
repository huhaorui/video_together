const express = require('express');
const mysql = require('mysql2');
const app = express();
const http = require('http');
const { generateShortUrl, storeUrlMapping, getLongUrl } = require('./short_url_service.cjs');

app.use(express.static('dist'));
app.use(express.json())

let map = new Map()

app.post("/send", (req, res) => {
    map.set(req.body.movie, req.body)
    res.json("OK")
});


app.post("/receive", (req, res) => {
    res.json(map.get(req.body.movie))
});


// 缩短URL的API
app.post('/share/shorten', (req, res) => {
    const longUrl = req.body["longUrl"];
    console.log(longUrl)
    generateShortUrl(longUrl, (err, shortUrl) => {
        if (err) {
            res.status(500).json({error: err});
            return;
        }
        res.json({shortUrl});
    });
});

// 还原URL的API
app.get('/share/toLongUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    getLongUrl(shortUrl, (err, longUrl) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (longUrl) {
            res.redirect(longUrl);
        } else {
            res.status(404).json({ error: 'URL not found' });
        }
    });
});

http.createServer(app).listen(7799,"::0");

