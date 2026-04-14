# Task Core Service (NestJS)

Core service kiểu Jira-like cho:
- users
- projects
- tasks
- workload
- AI assignment proxy

## Cài thư viện

```bash
npm install
```

## Chạy local

```bash
cp .env.example .env
npm run start:dev
```

## Thư viện chính đang dùng

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `@nestjs/config`
- `@nestjs/axios`
- `class-validator`
- `class-transformer`
- `rxjs`

## Các thư viện nên cài thêm khi lên phase tiếp theo

```bash
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/microservices amqplib amqp-connection-manager
```

## API base

- `GET /api/v1/health`
- `GET /api/v1/users`
- `GET /api/v1/projects`
- `GET /api/v1/tasks`
- `POST /api/v1/ai-assignment/recommend`

## Swagger

- UI: `http://localhost:3000/api/v1/docs`
- JSON: `http://localhost:3000/api/v1/docs-json`
