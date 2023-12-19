FROM node:20.10.0-alpine3.19

WORKDIR /home/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]