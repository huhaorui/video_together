const express = require('express');
const mysql = require('mysql2');
const app = express();
const http = require('http');
const {generateShortUrl, storeUrlMapping, getLongUrl} = require('./short_url_service.cjs');

require('express-async-errors');
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
app.post('/share/shorten', async (req, res) => {
    const longUrl = req.body["longUrl"];
    console.log(longUrl)
    const shortUrl = await generateShortUrl(longUrl);
    res.json({shortUrl});
});

// 还原URL的API
app.get('/share/toLongUrl', async (req, res) => {
    const shortUrl = req.query.shortUrl;
    console.log(shortUrl)
    const longUrl = await getLongUrl(shortUrl);
    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).json({error: 'URL not found'});
    }
});

app.get('/share/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;
    console.log(shortUrl)
    const longUrl = await getLongUrl(shortUrl);
    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).json({error: 'URL not found'});
    }
});

app.use((err, req, res, next) => {
    res.status(403);
    res.json({error: err.message});

})
http.createServer(app).listen(7799, "::0");

