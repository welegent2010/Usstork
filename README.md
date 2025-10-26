# 美股持仓成本计算器

Version: 1.0.0
Live: https://welegendt2018.github.io/Usstork/

一个功能完整的美股持仓成本计算器全栈应用，支持用户注册、登录、交易记录管理和实时盈亏计算。

## ✨ 功能特性

- 🔐 **完整的用户认证系统** - 注册、登录、JWT鉴权
- 📈 **实时股价获取** - 集成Alpha Vantage API
- 💰 **成本计算** - 自动计算平均成本和盈亏
- 📊 **数据可视化** - Chart.js成本变化趋势图
- 🎯 **加仓模拟器** - 预测加仓后的成本变化
- 📱 **响应式设计** - 移动端友好界面
- 🚀 **一键部署** - 支持Railway和Vercel

## 🛠 技术栈

### 后端
- **Node.js** + **Express.js** - RESTful API
- **Sequelize** - ORM数据库工具
- **SQLite** (开发) / **PostgreSQL** (生产)
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

### 前端
- **Vue 3** + **Composition API**
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Tailwind CSS** - 样式框架
- **Chart.js** - 数据可视化
- **Axios** - HTTP客户端

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <your-repo-url>
cd stock-calc
```

2. **安装依赖**
```bash
npm run install:all
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，设置您的配置
```

4. **初始化数据库**
```bash
npm run migrate
```

5. **启动开发服务器**
```bash
npm run dev
```

应用将在以下地址运行：
- 前端: http://localhost:5173
- 后端: http://localhost:4000

### 环境变量配置

```env
# Server Configuration
NODE_ENV=development
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Database Configuration
DB_TYPE=sqlite
DATABASE_URL=file:./dev.db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Alpha Vantage API (optional)
ALPHA_VANTAGE_API_KEY=demo
```

## 📦 部署指南

### 部署到 Railway (后端)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. 将代码推送到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. 点击上面的Railway按钮或访问railway.app

3. 配置环境变量：
   - `NODE_ENV=production`
   - `JWT_SECRET=生成一个强密码`
   - `DATABASE_URL=Railway提供的PostgreSQL连接字符串`

### 部署到 Vercel (前端)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 在Vercel导入您的GitHub仓库
2. 配置构建设置：
   - Framework: Vue.js
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
3. 设置环境变量：
   - `VITE_API_BASE=您的Railway后端URL/api`

### 一键部署脚本

```bash
# 部署后端到Railway
npm run deploy:backend

# 部署前端到Vercel
npm run deploy:frontend
```

## 📱 使用说明

### 1. 注册账户
- 访问应用首页，点击"注册"
- 输入邮箱和密码（至少6位）
- 注册成功后自动登录

### 2. 添加交易
- 点击"添加交易"
- 输入股票代码（如AAPL、TSLA等）
- 填写买入价格、股数和交易日期
- 系统自动计算总成本

### 3. 查看持仓
- 首页显示所有持仓概览
- 点击股票卡片查看详细信息
- 实时显示盈亏状态和百分比

### 4. 使用加仓模拟器
- 在股票详情页使用加仓模拟器
- 输入当前股价和想加仓的股数
- 查看加仓后的新平均成本

### 5. 配置API密钥
- 在首页输入Alpha Vantage API密钥
- 获取免费密钥：
  [Alpha Vantage官网](https://www.alphavantage.co/support/#api-key)
- 不配置密钥将使用模拟数据

## 📊 功能详解

### 成本计算逻辑
- **平均成本** = 总投入成本 / 总股数
- **总投入成本** = Σ(买入价格 × 股数 + 手续费)
- **盈亏计算** = (当前价格 - 平均成本) × 总股数

### 数据隔离
- 每个用户只能看到自己的交易数据
- JWT认证确保数据安全
- 用户密码使用bcrypt加密存储

### 实时更新
- 股价每30秒自动刷新
- 支持手动刷新数据
- 离线时显示最后获取的价格

## 🔧 开发指南

### 项目结构
```
stock-calc/
├── client/           # Vue.js前端
│   ├── src/
│   │   ├── views/    # 页面组件
│   │   ├── stores/   # Pinia状态管理
│   │   └── utils/    # 工具函数
│   └── package.json
├── server/           # Node.js后端
│   ├── src/
│   │   ├── models/   # 数据模型
│   │   ├── routes/   # API路由
│   │   └── middleware/ # 中间件
│   └── package.json
├── scripts/          # 部署和构建脚本
└── README.md
```

### 数据库模型

**Users表**
- id: UUID主键
- email: 用户邮箱（唯一）
- password_hash: 加密密码
- created_at: 创建时间

**Trades表**
- id: UUID主键
- user_id: 关联用户ID
- code: 股票代码
- price: 买入价格
- shares: 股数
- fee: 手续费
- date: 交易日期

### API接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/me` - 获取当前用户信息
- `GET /api/trades` - 获取用户所有交易
- `POST /api/trades` - 添加新交易
- `GET /api/trades/:code` - 获取特定股票交易
- `POST /api/trades/simulate/:code` - 模拟加仓

## 🐛 常见问题

### Q: 股价显示为模拟数据？
A: 请配置Alpha Vantage API密钥，或检查网络连接。

### Q: 部署后前端无法连接后端？
A: 检查环境变量`VITE_API_BASE`是否设置为正确的后端URL。

### Q: 数据库连接失败？
A: 确保数据库服务正常运行，并检查连接字符串配置。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

## 🚀 一键部署按钮

### Railway (后端)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/stock-calc)

### Vercel (前端)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/stock-calc)

**替换 `yourusername/stock-calc` 为您的GitHub仓库地址**