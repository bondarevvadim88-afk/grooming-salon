FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["node", "-e", "process.stdout.write('NODE STARTED\\n'); require('./dist/main.js')"]
