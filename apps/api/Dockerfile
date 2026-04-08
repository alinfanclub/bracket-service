FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build --workspace=@judo-bracket/api

# Expose port
EXPOSE 4000

# Start the app
CMD ["npm", "start", "--workspace=@judo-bracket/api"]
