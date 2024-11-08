FROM node:16.20

COPY dist .

EXPOSE 5011

CMD [ "node", "server.js" ]
