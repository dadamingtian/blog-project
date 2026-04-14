# 个人博客项目（Vue3 + Express + MongoDB）

一个前后端分离的个人博客系统，包含：
- 前台博客：文章列表、文章详情、分类/标签、搜索、归档、关于、评论
- 后台管理：管理员登录鉴权、文章管理、分类管理、标签管理、评论审核、站点设置、仪表盘
- 上传能力：本地 `uploads` 目录存储图片（封面、编辑器图片、头像）

技术栈：
- 前端：Vue 3 + Vite + Tailwind CSS + Element Plus + Pinia + ECharts
- 后端：Express + Mongoose + JWT + Multer
- 数据库：MongoDB

---

## 1. 目录结构

```txt
blog-project/
├─ frontend/               # 前端项目
├─ backend/                # 后端项目
├─ docs/                   # 项目文档
└─ README.md
```

---

## 2. 环境要求

- Node.js >= 18
- npm >= 9
- MongoDB >= 6

---

## 3. 环境变量配置

### 3.1 后端（`backend/.env`）

复制：

```bash
cd backend
cp .env.example .env
```

关键字段：
- `PORT`：后端端口（默认 `3000`）
- `API_PREFIX`：接口前缀（默认 `/api`）
- `MONGODB_URI`：MongoDB 连接串
- `JWT_SECRET`：JWT 密钥（生产环境必须强随机）
- `CORS_ORIGINS`：允许跨域来源（逗号分隔）
- `PUBLIC_SERVER_URL`：对外访问地址（用于上传文件 URL 生成）
- `COMMENT_DEFAULT_STATUS`：评论默认状态（`pending` 或 `approved`）
- `ADMIN_INIT_USERNAME` / `ADMIN_INIT_PASSWORD`：初始化管理员

### 3.2 前端（`frontend/.env`）

复制：

```bash
cd frontend
cp .env.example .env
```

关键字段：
- `VITE_API_BASE_URL`：后端 API 地址（例：`http://127.0.0.1:3000/api`）
- `VITE_PORT`：前端 dev 端口（默认 `5174`）

---

## 4. 安装与启动

### 4.1 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 4.2 初始化管理员账号

```bash
cd backend
npm run admin:init
```

### 4.3 启动开发服务

```bash
# 终端 1：后端
cd backend
npm run dev

# 终端 2：前端
cd frontend
npm run dev
```

默认访问：
- 前台：`http://localhost:5174`
- 后台登录：`http://localhost:5174/admin/login`
- 后端 API：`http://localhost:3000/api`

---

## 5. 常用脚本

### 后端

```bash
npm run dev          # 开发模式
npm run start        # 生产启动
npm run admin:init   # 初始化管理员
npm run test:smoke   # 冒烟测试（需先启动后端和 MongoDB）
```

### 前端

```bash
npm run dev          # 开发模式
npm run build        # 生产构建
npm run preview      # 预览构建产物
```

---

## 6. API 返回规范

统一结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- `code = 0` 表示成功
- 非 `0` 表示失败

---

## 7. 第 9 阶段测试与验收指引

详细测试文档见：
- [第9阶段-测试优化验收.md](./docs/第9阶段-测试优化验收.md)

核心建议：
1. 先跑后端冒烟测试：`cd backend && npm run test:smoke`
2. 再做前台/后台手工回归（按文档 checklist）
3. 最后进行构建验证：
   - `cd frontend && npm run build`
   - `cd backend && npm run start`

---

## 8. 生产部署建议（摘要）

- `NODE_ENV=production`
- 强随机 `JWT_SECRET`
- 配置真实域名的 `CORS_ORIGINS`
- 反向代理（Nginx）限制上传大小并开启 gzip
- MongoDB 账户最小权限、开启备份
- 日志与错误监控接入（建议 Sentry / ELK）

---

## 9. 已知说明

- 前端构建体积偏大（ECharts + 编辑器），后续可通过路由懒加载和 `manualChunks` 优化。
- 上传目前存储本地磁盘，生产环境建议迁移对象存储（OSS/S3）并保留接口协议。
