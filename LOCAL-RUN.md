# 本地运行

项目目录：`D:\Users\30721\Desktop\lcblog\B1gchangBlog`。

- 博客前台：http://127.0.0.1:5174/
- 管理端：http://127.0.0.1:5175/admin/
- 后端：http://127.0.0.1:18080/
- 管理员：`admin` / `admin`（仅供本地体验）

数据库使用已安装的 MySQL 8.4 程序，独立数据目录 `.local/mysql`，端口 `13307`。不使用现有 MySQL 服务的数据，也不依赖 Docker。已导入上游建表脚本及默认欢迎文章。

数据库密码和 JWT 密钥随机生成，保存在已忽略的 `B1gchangBlog-Backend/blog-server/src/main/resources/application-local-secret.yml`。数据库管理凭据保存在已忽略的 `.local/client.cnf`。请保留 `.local/mysql`，其中包含你之后创建的内容。

## 重新启动

以下命令适用于本机；服务已运行时无需重复启动。先在 PowerShell 中进入项目目录并启动数据库：

```powershell
cd D:\Users\30721\Desktop\lcblog\B1gchangBlog
Start-Process -FilePath 'C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe' -ArgumentList '--no-defaults','--basedir="C:/Program Files/MySQL/MySQL Server 8.4"','--datadir="D:/Users/30721/Desktop/lcblog/B1gchangBlog/.local/mysql"','--port=13307','--bind-address=127.0.0.1','--mysqlx=OFF','--log-error="D:/Users/30721/Desktop/lcblog/B1gchangBlog/.local/mysql.log"' -WindowStyle Hidden
```

然后分别在三个 PowerShell 窗口运行后端、前台、管理端：

```powershell
cd D:\Users\30721\Desktop\lcblog\B1gchangBlog
java -jar B1gchangBlog-Backend/blog-server/target/blog-server-0.0.1-SNAPSHOT.jar --spring.config.additional-location=file:B1gchangBlog-Backend/blog-server/src/main/resources/application-local-secret.yml --runtime.config.path=B1gchangBlog-Backend/blog-server/src/main/resources/runtime-config.yml
```

```powershell
cd D:\Users\30721\Desktop\lcblog\B1gchangBlog\B1gchangBlog-Frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

```powershell
cd D:\Users\30721\Desktop\lcblog\B1gchangBlog\B1gchangBlog-AdminPanel
npm.cmd run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

终端中的服务可用 Ctrl+C 停止。数据库可安全停止：

```powershell
& 'C:/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe' '--defaults-extra-file=D:/Users/30721/Desktop/lcblog/B1gchangBlog/.local/client.cnf' --execute=SHUTDOWN
```

## 本地适配

前端开发代理改为 `127.0.0.1:18080`，避免占用原有应用的 8080；后端 CORS 增加管理端的 localhost/127.0.0.1:5175 来源。服务只监听本机。

尚未配置七牛上传、AI 和独立 Twikoo 评论服务。个人资料已替换为 Big畅 / B1gchangBlog，头像使用本地 avatar.svg。评论暂未开放，已断开上游 Twikoo；可通过前后台 VITE_TWIKOO_URL 配置个人评论服务。背景和默认封面仍使用上游图片地址。
