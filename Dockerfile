# Use official Playwright image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.58.0-jammy

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy TypeScript config for path aliases
COPY tsconfig.json ./

# Copy source files (pages, fixtures, utils, test-data)
COPY src/ ./src/

# Copy test files and configs
COPY playwright.config.ts ./
COPY tests/ ./tests/
COPY env/ ./env/

# Default command - run all tests
CMD ["pnpm", "test"]
