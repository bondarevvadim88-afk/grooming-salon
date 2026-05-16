FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

RUN ls -la dist/ || echo "dist folder is empty or missing"

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && echo 'Starting node...' && node dist/main.js || echo 'Node failed with exit code '$?"]
