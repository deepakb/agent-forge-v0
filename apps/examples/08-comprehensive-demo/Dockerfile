FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/shared/package.json ./packages/shared/
COPY packages/llm-provider/package.json ./packages/llm-provider/
COPY apps/examples/08-comprehensive-demo/package.json ./apps/examples/08-comprehensive-demo/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build packages
RUN npm run build -w @agent-forge/core
RUN npm run build -w @agent-forge/shared
RUN npm run build -w @agent-forge/llm-provider
RUN npm run build -w @agent-forge/example-comprehensive-demo

CMD ["npm", "start", "-w", "@agent-forge/example-comprehensive-demo"]
