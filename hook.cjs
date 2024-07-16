const express = require('express');
const app = express();
const http = require('http');
const {exec} = require('child_process');

app.use(express.json())


app.post("/", (req, res) => {
    console.log(req.body.ref)
    if (req.body.ref.indexOf('master') >= 0) {
        console.log('触发WebHook')
        exec('bash /www/wwwroot/together.huhaorui.com/video_together/build.sh', {
            maxBuffer: 5 * 1024 * 1024,
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
    }
    res.json('ok')
});

http.createServer(app).listen(7796, "::0");