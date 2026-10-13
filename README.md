# B1gchangBlog

Big畅的个人博客，记录技术学习与日常生活：**健身、打瓦、打GO**。

- 作者：Big畅 / B1gchang
- GitHub：[hust-changge](https://github.com/hust-changge)
- 项目仓库：[hust-changge/lcblog2](https://github.com/hust-changge/lcblog2)
- 博客域名：[lingoace-community.xyz](http://lingoace-community.xyz/)（计划使用；本文不代表已完成公网部署）
- 联系邮箱：18872617747@163.com
- 建站日期：2026年10月12日

本项目基于 [AyeezBlog](https://github.com/Ayeez757/AyeezBlog) 二次开发，保留原项目许可证与贡献历史。

## 项目介绍

前台负责文章阅读与个人展示，管理端负责内容维护，后端提供 REST API。个人兴趣和学习方向包括：

- Java 全栈：Spring、Redis、MySQL、Kafka、OSS、Vue、CSS、MyBatis。
- AI Agent 开发：RAG、MCP、Harness、多智能体（目前太菜，只知道这么多）。

以上是个人学习标签，不代表项目已经集成全部技术。

## 当前功能与状态

- 首页文章流、Markdown 文章详情、分类标签、归档和友链。
- 说说、相册、关于页、追番列表和更新日志。
- 管理端登录及文章、分类、标签、友链、相册、说说等内容维护。
- 个人资料已替换为 Big畅 / B1gchangBlog；移除原作者旧站入口、社交账号与备案号。
- 使用本地 B1 默认头像；保留系统原生鼠标，使用 [tholman/cursor-effects](https://github.com/tholman/cursor-effects) 的 Fairy Dust 彩色星光拖尾，不显示绿色圆点或外层方框。触屏及启用减少动画的环境不初始化特效。
- 导航栏提供深色／浅色切换，默认深色，并在本机保存选择；手机端显示太阳／月亮按钮。
- 评论暂未开放，已断开原作者 Twikoo 服务；七牛上传和 AI 功能尚未配置。
- 背景及默认文章封面仍使用原项目图片地址。
- 已提供 GitHub Actions 构建和 GHCR 镜像部署配置，不自动 SSH 部署服务器。

## 技术栈

| 部分 | 当前技术 |
| --- | --- |
| 前台 | Vue 3、Vite、Vue Router、Axios、Markdown-it |
| 管理端 | Vue 3、Vite、Element Plus |
| 后端 | Spring Boot 3.2.0、MyBatis、PageHelper、JWT、BCrypt |
| 数据库 | MySQL 8.4 |
| 构建与运行 | Maven、npm、Docker Compose、Nginx、GitHub Actions、GHCR |
| 可选能力 | Twikoo、七牛上传、Spring AI / DeepSeek、即梦封面 |

Maven 编译目标为 Java 17，本机使用 JDK 17；Docker 后端使用 Java 21。容器构建前端使用 Node.js 22。

## 目录结构

```text
B1gchangBlog/
├── B1gchangBlog-Frontend/       # 博客前台
├── B1gchangBlog-AdminPanel/     # 内容管理端
├── B1gchangBlog-Backend/        # Maven 多模块后端
│   ├── blog-common/
│   ├── blog-pojo/
│   └── blog-server/
├── B1gchangBlog建表.sql         # 首次建表及默认欢迎文章
├── B1gchangBlog-migrate-user-password-bcrypt.sql
├── .github/workflows/registry-images.yml
├── deploy/registry/            # 当前镜像部署入口
├── deploy/prod/runtime-config.yml
├── tests/                      # 光标与个人化检查
└── LOCAL-RUN.md                # 当前 Windows 本机启动说明
```

Java 包名 `cn.ayeez`、数据库名 `ayeezblog` 保留，避免不必要的兼容性修改。GitHub 仓库名和 Compose 项目名仍为 `lcblog2`。

## 本地运行

### 当前开发电脑

当前目录：`D:\Users\30721\Desktop\lcblog\B1gchangBlog`。

| 服务 | 地址 |
| --- | --- |
| 博客前台 | http://127.0.0.1:5174/ |
| 管理端 | http://127.0.0.1:5175/admin/ |
| 后端 | http://127.0.0.1:18080/ |
| 独立 MySQL | 127.0.0.1:13307 |

本机数据库位于 `.local/mysql`，与其他项目数据库隔离。详细启动与停止命令见 [LOCAL-RUN.md](LOCAL-RUN.md)。本地默认管理员为 `admin / admin`，仅供本机体验。

### 从仓库重新安装

准备 Git、Node.js 22、JDK 17 或 21、Maven 3.9、MySQL 8.4，然后克隆：

```bash
git clone https://github.com/hust-changge/lcblog2.git B1gchangBlog
cd B1gchangBlog
```

在独立的 MySQL 实例上导入 `B1gchangBlog建表.sql`。脚本会创建 `ayeezblog` 数据库及默认数据，不能重复当作升级脚本执行。

创建 `B1gchangBlog-Backend/blog-server/src/main/resources/application-local-secret.yml`，填写本机连接信息和独立随机 JWT 密钥：

```yaml
hm:
  db:
    host: 127.0.0.1
    port: 13307
    username: your_database_user
    password: your_database_password
  jwt:
    secret-key: replace_with_a_random_secret_of_at_least_32_bytes
server:
  address: 127.0.0.1
  port: 18080
```

端口和账号应与自己的数据库一致。这个配置文件已被 Git 和 Docker 构建上下文忽略，不要提交真实密码。

在项目根目录编译并启动后端：

```bash
mvn -f B1gchangBlog-Backend/pom.xml package -DskipTests
java -jar B1gchangBlog-Backend/blog-server/target/blog-server-0.0.1-SNAPSHOT.jar
```

再分别打开两个终端：

```bash
cd B1gchangBlog-Frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

```bash
cd B1gchangBlog-AdminPanel
npm ci
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

前后台开发代理都指向 `127.0.0.1:18080`。Windows 若执行 npm.ps1 被限制，可改用 `npm.cmd`。

## 服务器部署：Actions 构建，服务器运行

当前部署入口是 `deploy/registry/compose.yml`。`deploy/prod/docker-compose.yml` 及旧 SSH 工作流是继承的配置，不作为本项目首次部署入口。

### 1. 等待镜像构建

推送 `main` 后，[Build lcblog2 images](https://github.com/hust-changge/lcblog2/actions) 构建两份 Linux amd64 镜像：

```text
ghcr.io/hust-changge/lcblog2-backend:<完整提交SHA>
ghcr.io/hust-changge/lcblog2-nginx:<完整提交SHA>
```

两个任务必须对应同一完整 SHA 且全部成功。Nginx 镜像包含前台和管理端静态文件，服务器不需要 Node.js、JDK 或 Maven，也不执行 `--build`。

### 2. 拉取源码并生成配置

服务器需安装 Docker、Docker Compose、Git 和 Python 3。以下 Bash 命令在服务器执行：

```bash
git clone https://github.com/hust-changge/lcblog2.git ~/B1gchangBlog
cd ~/B1gchangBlog
```

如服务器已配置本机 Mihomo 混合端口 7890，可给 Git 单独指定代理：

```bash
git config --local http.proxy socks5h://127.0.0.1:7890
git config --local http.version HTTP/1.1
```

首次克隆需要代理时，在 clone 命令的 `git` 后加入上述两个 `-c` 参数。Docker 出站代理需要另行配置，不能由 Git 代理替代。

确认当前提交的两个镜像构建成功后，首次生成私有配置：

```bash
python3 - <<'PY'
from pathlib import Path
import secrets
import subprocess

p = Path('deploy/registry/.env')
if p.exists():
    raise SystemExit('配置已存在，请保留，不要重新生成数据库密码。')
sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
p.touch(mode=0o600)
p.write_text(
    f'IMAGE_TAG={sha}\n'
    f'MYSQL_ROOT_PASSWORD={secrets.token_hex(24)}\n'
    f'MYSQL_PASSWORD={secrets.token_hex(24)}\n'
    f'HM_JWT_SECRET_KEY={secrets.token_hex(32)}\n'
    'HTTP_BIND=127.0.0.1\n', encoding='utf-8')
print('服务器配置已生成。')
PY
```

`.env` 保存数据库密码和镜像版本，已被 Git 忽略。已有数据库时不能更换密码来解决连接问题。

### 3. 登录镜像仓库并启动

私有 GHCR 包需要所属账号的 personal access token **classic**，权限为 `read:packages`。在 Password 提示处输入令牌，不要将令牌写进源码或聊天。

```bash
sudo docker login ghcr.io -u hust-changge
```

在当前服务器终端定义 Compose 简写；重新登录后需重新定义：

```bash
dc() {
  sudo docker compose --env-file deploy/registry/.env -f deploy/registry/compose.yml "$@"
}
```

逐条执行，前一步成功后再继续：

```bash
dc config --quiet
dc pull
dc up -d --no-build --pull never
dc ps
```

MySQL 首次自动导入建表脚本及欢迎文章，并禁用默认 `admin / admin` 账号。`mysql`、`backend` 应为 healthy，`nginx` 应为 Up。数据库使用 `lcblog2` 项目独立命名卷，MySQL 和后端不发布宿主机端口。

验证：

```bash
curl --noproxy '*' -fsS 'http://127.0.0.1/api/post/list?page=1&pageSize=12' | python3 -m json.tool --no-ensure-ascii
```

### 4. 设置个人管理员密码

Ubuntu 安装 BCrypt 工具：

```bash
sudo apt-get update
sudo apt-get install -y python3-bcrypt
```

生成密码哈希，密码输入不显示：

```bash
umask 077
python3 - <<'PY'
import bcrypt
import getpass
from pathlib import Path

password = getpass.getpass('新管理员密码：')
confirm = getpass.getpass('再次输入：')
if password != confirm:
    raise SystemExit('两次密码不一致。')
if len(password) < 12 or len(password.encode()) > 72:
    raise SystemExit('密码至少12个字符，UTF-8长度不超过72字节。')
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
Path('.admin-password.sql').write_text(
    "UPDATE `user` SET password='" + hashed + "', status=1 WHERE username='admin';\n",
    encoding='utf-8')
print('密码哈希已生成。')
PY
```

仅在生成成功后执行，数据库更新成功后再删除临时文件：

```bash
dc exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot ayeezblog' < .admin-password.sql
rm .admin-password.sql
```

用户名为 `admin`。不要把这个临时 SQL 文件提交到仓库。

### 5. 通过 SSH 隧道验收

在自己电脑执行，替换服务器地址，保持终端连接：

```bash
ssh -N -L 18000:127.0.0.1:80 admin@YOUR_SERVER_IP
```

浏览器访问 `http://127.0.0.1:18000/` 和 `http://127.0.0.1:18000/admin/`，验证个人资料、文章读取和新密码登录。

### 6. 开放首页

验收成功后，在服务器将 `.env` 的 `HTTP_BIND` 改为 `0.0.0.0` 并更新 Nginx：

```bash
sed -i 's/^HTTP_BIND=127.0.0.1$/HTTP_BIND=0.0.0.0/' deploy/registry/.env
dc up -d --no-build --pull never --force-recreate nginx
```

服务器安全组允许 TCP 80，域名 A 记录指向服务器公网 IP。当前配置只有 HTTP；HTTPS 证书与 443 监听尚需另外配置，在此之前后台登录使用 SSH 隧道。

### 更新、备份与排错

更新前先备份数据库，并将备份另存到服务器外：

```bash
mkdir -p ~/blog-backups
umask 077
dc exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -uroot --single-transaction --no-tablespaces --set-gtid-purged=OFF ayeezblog' > ~/blog-backups/ayeezblog-$(date +%Y%m%d-%H%M%S).sql
```

检查命令退出状态与备份文件，确认成功。更新流程：推送代码 → 两个镜像构建成功 → 服务器拉取源码 → 只更新 `.env` 的 `IMAGE_TAG` 为对应完整 SHA → `dc pull` → 更新 backend/nginx → 验收。保留数据库密码、卷和 Compose 项目名。

```bash
dc up -d --no-build --pull never --force-recreate backend nginx
dc ps
dc logs --tail=80 mysql backend nginx
```

**不要执行 `docker compose down -v`，不要删除 MySQL 数据卷。** 默认欢迎文章和友链已经进入数据库后，修改建表脚本不会更新现有数据，应通过管理端维护。

## 验证命令

在项目根目录执行：

```bash
node tests/cursor.cjs
node tests/personalization.cjs
node tests/theme.cjs
node deploy/registry/check.cjs
npm --prefix B1gchangBlog-Frontend run build
npm --prefix B1gchangBlog-AdminPanel run build
mvn -f B1gchangBlog-Backend/pom.xml package -DskipTests
```

部署配置检查需要 Docker Compose CLI，无需启动 Docker 引擎；Maven 命令是编译打包检查，跳过后端测试。

## 可选能力与项目来源

Twikoo 需部署自己的评论服务，并在前后台构建环境设置 `VITE_TWIKOO_URL`；Docker 构建目前没有注入此变量，启用时需要同步修改构建配置。七牛、DeepSeek 和即梦所需密钥及开关见后端 `application.yml`，当前镜像部署未注入这些可选配置。

`docs/` 中的历史文档及旧工作流保留了上游上下文，部署时以本 README 和 `deploy/registry/` 为准。

本项目基于 [Apache License 2.0](LICENSE) 开源。感谢 [阿叶 Ayeez / Ayeez757](https://github.com/Ayeez757) 提供原项目，原作者署名、许可证和 Git 贡献历史予以保留。


## 阿里云 OSS 图片上传

管理端支持上传文章封面、正文图片和说说图片，AI 封面也转存到 OSS。正文上传后自动插入 Markdown 链接。单张上限 10MB，支持 PNG/JPG/GIF/WebP。
完整的 Bucket、RAM 权限、图片域名和服务器 `.env` 配置见 [OSS 配置教程](deploy/OSS.md)。未配置 OSS 时仍可发布纯文字文章。
