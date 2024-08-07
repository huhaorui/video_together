#!/bin/zsh
source ~/.zshrc
cd /www/wwwroot/together.huhaorui.com/video_together/
git checkout .
git checkout master
git pull
nvm use 20
npm install
npm run build
rm *.zip
zip -r files node_modules dist server.cjs short_url_service.cjs .env
docker stop `docker ps -a | grep video_together| cut -c 1-12`
docker build -t 'video_together' .
docker run --restart=always -p 7799:7799 video_together &
