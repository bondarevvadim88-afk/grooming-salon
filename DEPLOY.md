# 🚀 Деплой на Railway — пошаговая инструкция

## Что деплоится

| Сервис | Описание |
|--------|----------|
| `grooming-api` | NestJS backend (Railway) |
| `Postgres` | PostgreSQL 15 (Railway плагин) |
| `Redis` | Redis 7 (Railway плагин) |
| `grooming-frontend` | Nginx + статика (опционально на Railway или отдельно) |

---

## Шаг 1 — Подготовка репозитория

```bash
git clone https://github.com/your-org/grooming-salon.git
cd grooming-salon

# Убедитесь что в .gitignore есть .env (не пушить секреты!)
git status
```

---

## Шаг 2 — Создание проекта в Railway

1. Перейдите на [railway.app](https://railway.app) → **New Project**
2. Выберите **Deploy from GitHub repo** → выберите ваш репозиторий
3. Railway автоматически определит `railway.toml`

---

## Шаг 3 — Добавление плагинов

В дашборде Railway нажмите **+ New Service**:

- **PostgreSQL** → Railway создаёт `DATABASE_URL` автоматически
- **Redis** → Railway создаёт `REDIS_URL` автоматически

> ⚠️ Railway's `REDIS_URL` имеет формат `redis://:password@host:port`.
> Вам нужно распарсить его или задать `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` вручную.

---

## Шаг 4 — Переменные окружения

В Railway → ваш сервис → вкладка **Variables** добавьте:

```
NODE_ENV=production
PORT=3000

# Генерируйте командой: openssl rand -base64 32
JWT_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=https://yoursalon.ru

# SMS
SMS_PROVIDER=smsc
SMS_API_KEY=<ваш ключ SMSC>
SMS_SENDER=GROOMING

# Email (port 587 + STARTTLS)
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=noreply@yoursalon.ru
SMTP_PASS=<пароль>

# Telegram
TELEGRAM_BOT_TOKEN=<токен от @BotFather>
TELEGRAM_WEBHOOK_URL=https://<ваш railway домен>/webhook/telegram

# VK
VK_SERVICE_TOKEN=<токен>
VK_GROUP_ID=<id группы>

# MAX (mail.ru)
MAX_API_KEY=<ключ>
MAX_BOT_ID=<id бота>

# Firebase
FCM_SERVER_KEY=<ключ>
```

> **DATABASE_URL** и **REDIS_URL** Railway подставляет сам из плагинов — не нужно задавать вручную.

---

## Шаг 5 — GitHub Token для CI/CD

1. GitHub → Settings → **Secrets and variables** → Actions
2. Добавьте секрет `RAILWAY_TOKEN`:
   - В Railway → Account Settings → **Tokens** → создайте новый

---

## Шаг 6 — Первый деплой

Railway запустит деплой автоматически при пуше в `main`.
Или запустите вручную:

```bash
npm install -g @railway/cli
railway login
railway up --service grooming-api
```

---

## Шаг 7 — Запуск миграций и сида

Railway выполняет их автоматически через `CMD` в Dockerfile:
```
npx prisma migrate deploy && node dist/main
```

Для ручного запуска сида (только первый раз):
```bash
railway run --service grooming-api npm run db:seed
```

---

## Шаг 8 — Проверка деплоя

```bash
# Health check
curl https://<your-railway-domain>/v1/services

# Swagger UI
open https://<your-railway-domain>/docs
```

---

## Шаг 9 — Фронтенд (статика)

**Вариант A — Railway Static Site:**
1. New Service → **Static Site**
2. Root: `frontend/`
3. Publish dir: `/` (оба HTML файла)

**Вариант B — Vercel/Netlify (бесплатно):**
```bash
# Vercel
npx vercel --cwd frontend

# Netlify
npx netlify deploy --dir frontend --prod
```

**Вариант C — VPS + Nginx:**
```bash
scp -r frontend/ user@yourserver:/var/www/grooming/
# Скопировать nginx/nginx.conf → /etc/nginx/sites-available/grooming
sudo nginx -t && sudo systemctl reload nginx
```

---

## Локальный запуск (разработка)

```bash
# 1. Зависимости
cd backend && npm install

# 2. Запустить инфраструктуру
docker-compose up -d postgres redis

# 3. Настроить .env
cp .env.example .env
# Отредактировать .env

# 4. Миграции + сид
npm run db:migrate:dev
npm run db:seed

# 5. Запустить API
npm run dev

# Откройте:
# API:     http://localhost:3000
# Swagger: http://localhost:3000/docs
# Widget:  открыть frontend/widget/index.html в браузере
# Admin:   открыть frontend/admin/index.html в браузере
```

---

## Мониторинг

| Инструмент | URL |
|------------|-----|
| Railway Logs | Dashboard → Deployments → Logs |
| Swagger UI | `https://your-domain/docs` |
| Bull Board (очереди) | `http://localhost:3001` (локально) |
| Prisma Studio | `npm run db:studio` (локально) |

---

## Откат деплоя

```bash
# Через Railway CLI
railway rollback --service grooming-api

# Или через дашборд: Deployments → выберите предыдущий → Redeploy
```

---

## Checklist перед релизом

- [ ] `DATABASE_URL` указывает на production базу
- [ ] `JWT_SECRET` ≥ 32 символов, сгенерирован случайно
- [ ] `REDIS_PASSWORD` задан
- [ ] `ALLOWED_ORIGINS` содержит только ваши домены
- [ ] `.env` не запушен в git (`git status` чист)
- [ ] Миграции прошли без ошибок (`prisma migrate deploy`)
- [ ] Health check отвечает 200
- [ ] Swagger доступен по `/docs`
- [ ] Тестовая запись через виджет проходит end-to-end
- [ ] SMS/Email уведомление пришло после тестовой записи
