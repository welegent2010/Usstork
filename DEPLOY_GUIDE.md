# 🚀 美股持仓成本计算器 - 部署指南

## 📋 部署前准备

### 1. 准备工作
- GitHub账户
- Railway账户 (https://railway.app)
- Vercel账户 (https://vercel.com)
- (可选) Alpha Vantage API密钥

### 2. 获取Alpha Vantage API密钥
1. 访问 https://www.alphavantage.co/support/#api-key
2. 注册免费账户
3. 获取API密钥（每分钟5次调用限制）

## 🚀 一键部署

### 方法1: 使用部署按钮

#### 后端部署到Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/stock-calc)

#### 前端部署到Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/stock-calc)

### 方法2: 手动部署

## 📦 后端部署 (Railway)

### 步骤1: 推送代码到GitHub
```bash
# 初始化git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Stock Calculator App"

# 添加远程仓库（替换为您的GitHub仓库URL）
git remote add origin https://github.com/YOUR_USERNAME/stock-calc.git

# 推送到GitHub
git push -u origin main
```

### 步骤2: Railway部署
1. 登录Railway (https://railway.app)
2. 点击"New Project"
3. 选择"Deploy from GitHub repo"
4. 选择您的stock-calc仓库
5. 等待部署完成

### 步骤3: 配置环境变量
在Railway项目设置中添加以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=生成一个随机字符串（至少32位）
DATABASE_URL=Railway自动提供的PostgreSQL连接字符串
FRONTEND_URL=您的Vercel前端URL（部署后更新）
```

**生成JWT密钥：**
```bash
openssl rand -base64 32
```

### 步骤4: 验证部署
1. 访问Railway提供的URL
2. 检查 `/api/health` 端点是否返回 `{"status":"OK"}`

## 🎨 前端部署 (Vercel)

### 步骤1: Vercel部署
1. 登录Vercel (https://vercel.com)
2. 点击"New Project"
3. 导入GitHub仓库
4. 配置构建设置：
   - Framework: Vue.js
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

### 步骤2: 配置环境变量
在Vercel项目设置中添加：

```env
VITE_API_BASE=您的Railway后端URL/api
```

### 步骤3: 部署
点击"Deploy"按钮，等待部署完成。

## 🔧 部署后配置

### 1. 更新CORS设置
在Railway中更新 `FRONTEND_URL` 为您的Vercel URL。

### 2. 配置Alpha Vantage API
1. 访问您的应用 (Vercel URL)
2. 注册/登录账户
3. 在首页输入Alpha Vantage API密钥
4. 点击"保存"

### 3. 测试功能
1. 添加一笔测试交易
2. 查看持仓概览
3. 测试加仓模拟器
4. 验证数据图表

## 🛠 常用命令

### 本地开发
```bash
# 安装所有依赖
npm run install:all

# 启动开发服务器
npm run dev

# 初始化数据库
npm run migrate

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 部署脚本
```bash
# 部署到Railway
npm run deploy:railway

# 部署到Vercel
npm run deploy:vercel
```

## 🔍 故障排除

### 问题1: 前端无法连接后端
**症状**: 登录/注册失败，API调用报错
**解决**:
1. 检查Vercel中的 `VITE_API_BASE` 环境变量
2. 确保Railway中的 `FRONTEND_URL` 正确设置
3. 验证后端健康检查端点 `/api/health`

### 问题2: 数据库连接失败
**症状**: 用户注册/登录时报数据库错误
**解决**:
1. 检查Railway中的 `DATABASE_URL` 环境变量
2. 确保数据库服务正常运行
3. 查看Railway部署日志

### 问题3: 股价不更新
**症状**: 股价显示为模拟数据或不变
**解决**:
1. 检查Alpha Vantage API密钥是否正确设置
2. 查看浏览器控制台是否有API错误
3. 确认API密钥没有达到调用限制

### 问题4: JWT认证失败
**症状**: 登录后无法访问受保护页面
**解决**:
1. 检查前后端的 `JWT_SECRET` 是否一致
2. 清除浏览器localStorage中的token
3. 重新登录

## 📊 监控和维护

### Railway监控
- 查看应用性能指标
- 监控数据库使用情况
- 检查错误日志

### Vercel监控
- 查看前端性能分析
- 监控API调用情况
- 分析用户访问数据

### 定期维护
- 定期备份数据库
- 更新依赖包版本
- 监控API调用限额

## 🌟 高级配置

### 自定义域名
1. 在Vercel中添加自定义域名
2. 配置DNS解析
3. 更新Railway中的 `FRONTEND_URL`

### 性能优化
- 启用CDN加速
- 配置缓存策略
- 优化图片和静态资源

### 安全加固
- 启用HTTPS强制跳转
- 配置CSP策略
- 定期轮换JWT密钥

## 📞 技术支持

如有问题，请：
1. 检查应用日志
2. 查看GitHub Issues
3. 联系技术支持

---

**🎉 恭喜！您已成功部署美股持仓成本计算器！**