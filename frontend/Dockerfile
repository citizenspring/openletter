# Use Node.js 22 (LTS) as the base image
FROM node:22-alpine

# Install curl
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy the application code
COPY . /app

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 