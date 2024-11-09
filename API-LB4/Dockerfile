# Use a specific version of Node.js
FROM node:16-slim

# Create and set the working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application source code
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose the application port
EXPOSE ${PORT}

# Start the application
CMD [ "node", "dist/index.js" ]