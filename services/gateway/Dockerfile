# Dockerfile

FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Expose port
EXPOSE 4002

# Run the app
CMD ["node", "index.js"]