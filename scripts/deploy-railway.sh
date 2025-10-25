#!/bin/bash

# 部署后端到Railway的脚本

echo "🚀 开始部署到Railway..."

# 检查是否安装了Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ 请先安装Railway CLI:"
    echo "npm i -g @railway/cli"
    exit 1
fi

# 登录Railway
echo "🔐 登录Railway..."
railway login

# 部署
echo "📦 部署应用..."
railway up

# 显示部署信息
echo "✅ 部署完成！"
railway status