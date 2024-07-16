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

// 生成短链接的函数
function generateShortUrl(longUrl, callback) {
    let hash;
    let shortUrl;
    // 检查冲突
    let flag = true
    do {
        hash = crypto.createHash('sha256').update(longUrl + Math.random().toString()).digest();
        shortUrl = base64url.encode(hash.slice(0, 6));

        // 读数据库，检查短链接是否已经存在
        getShortUrl(shortUrl, (err, exist_flag) => {
            if (err) {
                callback(err);
                return;
            }
            flag = exist_flag;
        })
    } while (flag);

    // 存储shortUrl
    storeUrlMapping(longUrl, shortUrl, (err, shortUrl) => {
        if (err) {
            callback(err);
        }
    });

    callback(null, shortUrl);
}



// 操作数据库 ///////////////////////////////////////////////////////
// 存储长链接和短链接的映射
function storeUrlMapping(longUrl, shortUrl, callback) {
    const query = 'INSERT INTO url_mapping (long_url, short_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE short_url=VALUES(short_url)';
    connection.query(query, [longUrl, shortUrl], (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, shortUrl);
    });
}

// 通过短链接获取长链接
function getLongUrl(shortUrl, callback) {
    const query = 'SELECT long_url FROM url_mapping WHERE short_url = ?';
    connection.query(query, [shortUrl], (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        if (results.length > 0) {
            callback(null, results[0].long_url);
        } else {
            callback(null, null);
        }
    });
}

// 是否存在指定shortUrl
function getShortUrl(shortUrl, callback) {
    const query = 'SELECT short_url FROM url_mapping WHERE short_url = ?';
    connection.execute(query, [shortUrl], (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        if (results.length > 0) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}

module.exports = {
    generateShortUrl,
    storeUrlMapping,
    getLongUrl
};