# Use Node.js LTS
FROM node:20

# Set working directory
WORKDIR /calculator

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY server.js .
COPY calculator.html .

# Expose the port used by server.js
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
