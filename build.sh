#!/bin/bash
cd /www/wwwroot/together.huhaorui.com/video_together/
git pull
npm install
npm run build
rm *.zip
zip -r files node_modules dist server.cjs
docker stop `docker ps -a | grep video_together| cut -c 1-12`
docker build -t 'video_together' .
docker run -p 7799:7799 video_together --restart=always &