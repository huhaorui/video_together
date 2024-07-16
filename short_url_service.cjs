const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto');
const base64url = require('base64url');
const app = express();
const http = require('http');


// MySQL 数据库连接配置
const connection = mysql.createConnection({
    host: 'huhaorui.com',
    user: 'short_link',
    password: 'PbaGf73bdbnBE2sS',
    database: 'short_link'
});
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

function getConnection() {
    return connection.promise()
}

// 生成短链接的函数
async function generateShortUrl(longUrl) {
    let hash;
    let shortUrl;
    // 检查冲突
    let flag = true
    do {
        hash = crypto.createHash('sha256').update(longUrl + Math.random().toString()).digest();
        shortUrl = base64url.encode(hash.slice(0, 6));
        // 读数据库，检查短链接是否已经存在
        flag = await getShortUrl(shortUrl)
    } while (flag);
    // 存储shortUrl
    await storeUrlMapping(longUrl, shortUrl);
    return shortUrl
}


// 操作数据库 ///////////////////////////////////////////////////////
// 存储长链接和短链接的映射
async function storeUrlMapping(longUrl, shortUrl) {
    const query = 'INSERT INTO url_mapping (long_url, short_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE short_url=VALUES(short_url)';
    await getConnection().execute(query, [longUrl, shortUrl])
}

// 通过短链接获取长链接
async function getLongUrl(shortUrl) {
    const query = 'SELECT long_url FROM url_mapping WHERE short_url = ?';
    const [results, fields] = await getConnection().execute(query, [shortUrl])
    if (results.length > 0) {
        return results[0].long_url
    } else {
        return null
    }
}

// 是否存在指定shortUrl
async function getShortUrl(shortUrl) {
    const query = 'SELECT short_url FROM url_mapping WHERE short_url = ?';
    const [results, fields] = await getConnection().execute(query, [shortUrl])
    return results.length > 0
}

module.exports = {
    generateShortUrl,
    storeUrlMapping,
    getLongUrl
};