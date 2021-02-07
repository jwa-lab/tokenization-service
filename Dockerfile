FROM node:12-alpine

USER node

WORKDIR /app

COPY src ./src
COPY package.json .
COPY package-lock.json .
COPY LICENSE .
COPY tsconfig.json .

RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "run", "start"]