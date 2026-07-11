FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY server.js .
RUN mkdir -p files && echo "This is a dummy invoice PDF content." > files/invoice_204.pdf
ENV FLAG="CGS{test-flag}"
EXPOSE 3000
CMD ["npm", "start"]
