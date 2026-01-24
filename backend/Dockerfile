FROM node:20-alpine

WORKDIR /app

# Install only dependencies first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose is optional, but fine to keep
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
