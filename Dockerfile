FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE
ARG VITE_API_PORT=3011
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_API_PORT=${VITE_API_PORT}

RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
