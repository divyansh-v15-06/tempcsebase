FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
# react 19 + @mui/material 5 disagree on peer deps; matches the local install
RUN npm ci --legacy-peer-deps
COPY . .
# Baked in at build time (Next.js compiles NEXT_PUBLIC_* into the bundle).
# /backend is the proxy prefix nginx strips before forwarding to the API.
ARG NEXT_PUBLIC_API_URL=/backend
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
