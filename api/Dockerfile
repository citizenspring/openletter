# Use Node.js 16 as the base image
FROM node:16-alpine

# Install curl
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy the application code
COPY . /app

# AdonisJS 4 crashes if .env doesn't exist; Coolify injects env vars at runtime
RUN touch /app/.env

# Install dependencies
RUN npm i

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 