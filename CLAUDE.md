# Empresarium — CLAUDE.md

## Обзор
SaaS-платформа для регистрации компаний в странах Латинской Америки (BR, CL, CO, PE, AR).
Клиенты создают заказы, юридические партнёры их обрабатывают. Включает мессенджер, документы, трекинг статусов.

## Стек
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **shadcn/ui** + Tailwind CSS
- **next-intl** — 4 локали: EN, ES, PT, RU
- **react-hook-form** + **Zod** валидация
- **Node 24** (через `.node-version`)

## Структура проекта
```
src/app/[locale]/          # Роутинг по локалям
  (auth)/                  # Вход, регистрация (OTP, без паролей)
  (dashboard)/             # Защищённые: дашборд, заказы, сообщения, профиль, админка
  auth/callback/           # Supabase auth callback
src/components/            # UI (shadcn), layout, auth, orders, messages, documents, admin, shared
src/lib/actions/           # Server Actions (мутации)
src/lib/queries/           # Загрузка данных (серверная)
src/lib/supabase/          # 3 клиента: server.ts, client.ts, admin.ts
src/lib/hooks/             # Realtime хуки (сообщения, статус заказа)
src/lib/validations/       # Zod-схемы (auth, order, profile)
src/types/                 # database.ts, order.ts, country.ts
messages/{en,es,pt,ru}.json
src/lib/email.ts           # Resend (отправка OTP-кодов)
supabase/migrations/       # 16 SQL-миграций
supabase/seed.sql          # 5 стран, 17 типов юрлиц, поля форм
```

## Ключевые архитектурные решения
- **Без `<Database>` generic в Supabase-клиентах** — рукописные типы не содержат `PostgrestVersion`, что вызывает `never`. Все клиенты нетипизированные; `database.ts` только для справки.
- **Data-driven конфиг стран** — страны, типы юрлиц, поля форм хранятся в БД (не в коде). Добавить страну = INSERT.
- **JSONB для данных по стране** — `orders.form_data`, `founders.extra_data`
- **Server Components для чтения, Server Actions для мутаций** — минимум клиентского JS
- **OTP-авторизация без паролей** — вход/регистрация через 6-значный email-код. Двухшаговый Route Handler: `sendOtp()` → хеш в `otp_codes` → код через Resend → `POST /api/auth/session` (проверка хеша, генерация magic link, возврат `tokenHash`) → `GET /api/auth/session?token_hash=...` (навигация, `verifyOtp`, cookie через redirect) → дашборд.
- **RLS admin-проверки через `is_admin(auth.uid())`** — все admin RLS-политики используют `SECURITY DEFINER` функцию вместо прямого `SELECT FROM profiles` (миграция 00015, предотвращает бесконечную рекурсию).

## База данных
15 таблиц: profiles, countries, entity_types, country_form_fields, orders, founders, order_status_history, conversations, messages, documents, required_documents, addons, partner_countries, otp_codes

3 роли: client, partner, admin (с RLS-политиками)

## Текущий статус (MVP)
| Компонент | Статус |
|-----------|--------|
| Авторизация (OTP, без паролей) | Готово |
| Email через Resend (OTP-коды) | Готово |
| Визард создания заказа (7 шагов) | Готово |
| Управление заказами + статус-пайплайн | Готово |
| Мессенджер (realtime) | Готово |
| Загрузка/скачивание документов | Готово |
| Админ-панель | Готово |
| i18n (EN/ES/PT/RU) | Готово |
| Миграции + seed-данные | Готово |
| Деплой на Railway | Готово |

## План развития

### Фаза 2 — Продакшн-готовность
- [ ] Убрать диагностический логгинг из auth-флоу (`profile.ts`, `route.ts`)
- [ ] Сгенерировать типы Supabase (`supabase gen types typescript`) и вернуть `<Database>` generic
- [ ] E2E-тесты (Playwright): auth, создание заказа, мессенджер
- [ ] Мониторинг ошибок (Sentry)
- [ ] Rate limiting на API-роуты
- [ ] SEO мета-теги и OG-изображения

### Фаза 3 — Платежи и биллинг
- [ ] Интеграция Stripe (или MercadoPago для LATAM)
- [ ] Ценообразование по странам и типам юрлиц
- [ ] Страница оплаты в визарде заказа
- [ ] Инвойсы и история платежей
- [ ] Вебхуки для обновления статуса оплаты

### Фаза 4 — Уведомления и UX
- [ ] Email-уведомления: смена статуса заказа, новые сообщения
- [ ] Push-уведомления (web)
- [ ] Дашборд партнёра: аналитика, загрузка, назначенные заказы
- [ ] Маркетинговый лендинг (/)
- [ ] Мобильная адаптация (проверить и доработать)

### Фаза 5 — Масштабирование
- [ ] Новые страны: MX, UY, EC, BO, PA
- [ ] REST API для внешних интеграций
- [ ] Мультиязычные шаблоны документов
- [ ] Автогенерация учредительных документов
- [ ] Партнёрская программа (реферальные ссылки)

## Деплой
- **GitHub**: https://github.com/golatam/empresarium
- **Railway**: https://empresarium-production.up.railway.app
- **Auto-deploy**: пуш в `main` → Railway собирает и деплоит автоматически
- **Supabase env vars** нужно задать в Railway Dashboard

## Команды
```bash
npm run dev     # Локальный dev-сервер
npm run build   # Продакшн-сборка
npm run start   # Продакшн-сервер
git push        # Деплой на Railway (auto-deploy из main)
railway up      # Ручной деплой (фоллбэк)
```
