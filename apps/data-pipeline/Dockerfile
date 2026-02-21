FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/data-pipeline/package.json ./apps/data-pipeline/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY apps/data-pipeline ./apps/data-pipeline
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

WORKDIR /app/apps/data-pipeline

CMD ["pnpm", "start"]
