# Menggunakan base image Node.js (Node 20+ dibutuhkan oleh better-sqlite3)
FROM node:20-slim

# Install tools yang dibutuhkan untuk compile native module (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json dari root
COPY package*.json ./

# Install dependencies aplikasi
RUN npm install

# Salin seluruh kode proyek (backend dan frontend)
COPY . .

# Buka port aplikasi (sesuaikan port backend, misal 3000)
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["node", "backend/server.js"]