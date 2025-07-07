FROM node:18-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json yarn.lock ./
RUN yarn install

# Copy app and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build && yarn export

# Serve the static site
FROM node:18-alpine
WORKDIR /app

RUN yarn global add serve

COPY --from=builder /app/out .

EXPOSE 8080
CMD ["serve", "-s", ".", "-l", "8080"]
