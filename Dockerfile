# Use the official Node.js image as a base
FROM node:18-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/


# Install dependencies with caching
RUN npm ci --legacy-peer-deps

# Copy application code after dependencies are installed
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port that Next.js uses
EXPOSE 3000

# Default command to run Next.js in development mode
CMD ["npm", "run", "dev"]
