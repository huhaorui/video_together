const mysql = require('mysql2');
require('dotenv').config('./env')
const {DB_HOST, DB_NAME, DB_USER, DB_PWD} = process.env

// MySQL 数据库连接配置
let mysqlConnection = null;

const getMysqlConnection = async () => {
    // Check to see if connection exists and is not in the "closing" state
    if (!mysqlConnection || mysqlConnection?.connection?._closing) {
        mysqlConnection = await createNewMysqlConnection();
    }
    return mysqlConnection.promise();
}

const executeSQL = async (sql, params) => {
    const conn = await getMysqlConnection()
    const [results, fields] = await conn.execute(sql, params)
    return [results, fields]
}

const createNewMysqlConnection = async () => {
    return mysql.createConnection({
        host: DB_HOST,
        database: DB_NAME,
        user: DB_USER,
        password: DB_PWD,
    });
}

// 生成短链接的函数
async function generateShortUrl(longUrl) {
    let shortUrl;
    // 检查冲突
    do {
        shortUrl = Math.round((Math.random() * 0xFFFFFFFF)).toString(16).toUpperCase() //不如直接随机数吧，反正加不加url，其实没啥区别
        while (shortUrl.length < 8) {
            shortUrl = `0${shortUrl}`
        }
        // 读数据库，检查短链接是否已经存在
    } while (await checkShortUrlExists(shortUrl));
    // 存储shortUrl
    await storeUrlMapping(longUrl, shortUrl);
    return shortUrl
}


// 操作数据库 ///////////////////////////////////////////////////////
// 存储长链接和短链接的映射
async function storeUrlMapping(longUrl, shortUrl) {
    const query = 'INSERT INTO url_mapping (long_url, short_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE short_url=VALUES(short_url)';
    await executeSQL(query, [longUrl, shortUrl])
}

// 通过短链接获取长链接
async function getLongUrl(shortUrl) {
    const query = 'SELECT long_url FROM url_mapping WHERE short_url = ?';
    const [results, fields] = await executeSQL(query, [shortUrl])

    if (results.length > 0) {
        return results[0].long_url
    } else {
        return null
    }
}

// 是否存在指定shortUrl
async function checkShortUrlExists(shortUrl) {
    const query = 'SELECT short_url FROM url_mapping WHERE short_url = ?';
    const [results, fields] = await executeSQL(query, [shortUrl])
    return results.length > 0
}

module.exports = {
    generateShortUrl,
    storeUrlMapping,
    getLongUrl
};