FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "server-test.js"]
