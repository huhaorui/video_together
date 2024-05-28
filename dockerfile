FROM node
WORKDIR /root/
COPY files.zip /root/
RUN unzip files.zip
EXPOSE 7799
ENTRYPOINT [ "node" , "server.js"]
