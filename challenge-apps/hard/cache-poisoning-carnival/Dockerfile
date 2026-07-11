FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY server.js .
EXPOSE 3000
ENV FLAG=CGS{test-flag}
CMD ["node", "server.js"]
