FROM node:16.20

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

EXPOSE 5000

CMD [ "yarn", "start-prod-server" ]
