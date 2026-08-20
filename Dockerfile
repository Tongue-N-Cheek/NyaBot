FROM node:26-alpine AS builder

WORKDIR /app

RUN \
	--mount=type=cache,target=/root/.npm \
	--mount=type=bind,source=package.json,target=package.json \
	npm install

COPY . .
RUN npm run build

FROM node:26-alpine AS deps

WORKDIR /app

RUN \
	--mount=type=cache,target=/root/.npm \
	--mount=type=bind,source=package.json,target=package.json \
	npm install --omit=dev

FROM node:26-alpine AS runner

ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

CMD ["node", "--env-file", "/run/secrets/nyabot",  "dist/main.js"]
