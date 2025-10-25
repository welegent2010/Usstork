#!/bin/bash

# 部署前端到Vercel的脚本

echo "🚀 开始部署到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 请先安装Vercel CLI:"
    echo "npm i -g vercel"
    exit 1
fi

# 构建前端
echo "📦 构建前端..."
cd client
npm run build

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

# 返回根目录
cd ..

echo "✅ 部署完成！"