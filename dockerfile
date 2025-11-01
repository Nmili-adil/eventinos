# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native bindings
RUN npm install --legacy-peer-deps && npm rebuild

# Copy the rest of the app
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run the app
CMD ["npm", "run", "dev"]
