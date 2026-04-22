FROM node:22.19-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
