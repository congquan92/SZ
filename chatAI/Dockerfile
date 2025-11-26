# Dùng node bản nhẹ (Alpine) cho nhanh gọn
FROM node:20-alpine
# Tạo thư mục làm việc trong container
WORKDIR /app
# Copy package.json và package-lock.json (nếu có) vào trước
COPY package*.json ./
# Cài đặt thư viện
RUN npm install
# Copy toàn bộ code nguồn vào
COPY . .
# Mở cổng 3000
EXPOSE 3000
# Chạy ứng dụng
CMD ["node", "src/app.js"]