# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Increase memory limit for the build process and build the application
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Expose the port your app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"]