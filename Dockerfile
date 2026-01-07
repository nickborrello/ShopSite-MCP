FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x dist/src/index.js

ENV SHOPSITE_BASE_URL=""
ENV SHOPSITE_CLIENT_ID=""
ENV SHOPSITE_CLIENT_SECRET=""
ENV SHOPSITE_AUTH_CODE=""
ENV SHOPSITE_USER=""
ENV SHOPSITE_PASS=""

CMD ["node", "dist/src/index.js"]
