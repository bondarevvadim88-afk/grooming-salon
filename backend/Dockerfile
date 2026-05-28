FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install

COPY . .

WORKDIR /app/backend

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
