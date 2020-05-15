FROM node:14-alpine
WORKDIR /usr/src/rental-contracts-management/server
COPY ./server/package*.json ./
RUN npm i
WORKDIR /usr/src/rental-contracts-management
COPY . .
WORKDIR /usr/src/rental-contracts-management/server
EXPOSE 3000
CMD ["npm", "start"]