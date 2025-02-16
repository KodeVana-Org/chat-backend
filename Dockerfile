# Stage 1: Install dependencies
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# RUN npm install --omit=dev
RUN npm install --omit=dev && npm install ts-node nodemon

# Stage 2: Copy only necessary files
FROM node:22-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
# COPY public ./public

# Expose port
EXPOSE 6969

# Run the app
CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "start"]

# # Stage 1: Install dependencies
# FROM node:22-alpine AS builder
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --omit=dev
#
# # Stage 2: Copy only necessary files
# FROM node:22-alpine
# WORKDIR /usr/src/app
# COPY --from=builder /usr/src/app/node_modules ./node_modules
# COPY . .
#
# # Expose port
# EXPOSE 6969
#
# # Run the app
# CMD ["npm", "run", "dev"]
#
