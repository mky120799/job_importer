# Official Node runtime
FROM node:24-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy application source
COPY . .

# Expose default port
EXPOSE 4000

# Default command: start the server. To run worker override command to `npm run worker`
CMD ["npm","start"]
