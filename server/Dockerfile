FROM mcr.microsoft.com/playwright:v1.50.0-noble
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server .
COPY shared /shared

EXPOSE 3001

CMD ["node", "server.js"]
