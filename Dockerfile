# 使用Node.js官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 安装所有依赖（包括dev依赖用于构建）
RUN npm run install:all

# 构建前端
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]