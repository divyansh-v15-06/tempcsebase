FROM node:20-bookworm-slim

# libreoffice-writer: docx -> pdf conversion for resumes/reports
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice-writer fonts-liberation fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN mkdir -p public/temp/image public/temp/pdf

ENV NODE_ENV=production \
    BACKEND_PORT=3001 \
    LIBREOFFICE_PATH=/usr/bin/soffice

EXPOSE 3001
CMD ["node", "src/index.js"]
