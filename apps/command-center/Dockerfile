FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY src ./src
COPY public ./public
COPY db ./db
COPY scripts ./scripts
COPY .env.example ./
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 4173
VOLUME ["/app/data"]
CMD ["node", "src/server.mjs"]
