# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências (com legacy-peer-deps para resolver conflitos)
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar PM2 globalmente
RUN npm install -g pm2

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção (com legacy-peer-deps)
RUN npm ci --only=production --legacy-peer-deps

# Copiar build do frontend do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar código do servidor
COPY server ./server
COPY database ./database

# Copiar arquivos de configuração
COPY ecosystem.config.js ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Criar diretório de logs
RUN mkdir -p /app/logs

# Expor porta
EXPOSE 3001

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start com PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
