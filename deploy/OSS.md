# B1gchangBlog 阿里云 OSS 图片配置

文章封面、正文图片、说说图片和 AI 生成的封面均写入 OSS。单张限制 10MB，支持 PNG/JPG/GIF/WebP；正文图片按钮会把链接插入 Markdown 末尾。
上传路径：浏览器 → 已登录的博客后端 → OSS。浏览器不会获得 AccessKey，不需要 OSS 上传 CORS 配置。
纯文字文章仍可在未配置 OSS 时发布；现有图片链接不会被修改或自动迁移。

## 1. 创建专用 Bucket

登录阿里云 OSS 控制台，创建专门存放博客公开图片的 Bucket，名称自行选择，如 `b1gchangblog-images`（若已占用则换名）。
地域按自己的实际选择填写；与 ECS 同地域时服务端可以使用内网 Endpoint。存储类型选择标准存储。
该方案返回永久公开图片 URL，所以需允许匿名读取图片。专用公开图片 Bucket 可设置“公共读”（写入仍需认证），不要选择“公共读写”。若启用了阻止公共访问，请根据控制台提示调整专用图片 Bucket 的设置；不要在这个 Bucket 存放私人文件。

## 2. 配置图片域名

建议使用 `img.lingoace-community.xyz`。这与主站域名独立，不要修改主站的 A 记录。

1. 在 OSS Bucket 的域名管理里绑定 `img.lingoace-community.xyz`，按控制台要求完成域名验证。
2. 在域名 DNS 添加主机记录 `img`、记录类型 CNAME，目标为控制台提供的 Bucket CNAME 地址。
3. 当前使用 HTTP 访问图片，无需为图片域名申请证书；若以后改用 HTTPS，再配置证书。
4. 中国内地地域绑定域名若要求备案，应先满足控制台的备案要求。

OSS 默认域名对部分图片类型可能返回强制下载头，不能把它当作稳定的图片展示域名。参考 [阿里云自定义域名文档](https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names)。

## 3. 创建上传用 RAM 用户

在 RAM 控制台创建专门用于博客上传的用户，生成 AccessKey ID / AccessKey Secret。将密钥自行保存到服务器，不要发到聊天或提交 Git。
添加自定义权限策略，把下面 `YOUR_BUCKET` 替换成实际 Bucket 名称：

```json
{
  "Version": "1",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["oss:PutObject"],
    "Resource": [
      "acs:oss:*:*:YOUR_BUCKET/covers/*",
      "acs:oss:*:*:YOUR_BUCKET/talks/*",
      "acs:oss:*:*:YOUR_BUCKET/images/*"
    ]
  }]
}
```

将该策略授权给上传用 RAM 用户。应用不需要删除对象、修改 Bucket 权限或列出全部文件。
上传权限依据：[阿里云 PutObject 文档](https://www.alibabacloud.com/help/zh/oss/developer-reference/putobject)。

## 4. 填写服务器 .env

**必须先部署包含 OSS 改动的新版本**：旧镜像不支持以下配置。
在服务器执行：

```bash
cd ~/B1gchangBlog
nano deploy/registry/.env
```

追加以下内容（示例选择上海，务必按 Bucket 实际地域修改）：

```dotenv
# 与 ECS 同地域时，上传可以用 HTTPS 内网 Endpoint。
OSS_ENDPOINT=https://oss-cn-shanghai-internal.aliyuncs.com
OSS_REGION=cn-shanghai
OSS_BUCKET=YOUR_BUCKET
OSS_ACCESS_KEY_ID=YOUR_RAM_ACCESS_KEY_ID
OSS_ACCESS_KEY_SECRET=YOUR_RAM_ACCESS_KEY_SECRET
OSS_PUBLIC_URL=http://img.lingoace-community.xyz
```

`OSS_ENDPOINT` 是服务端上传地址，`OSS_PUBLIC_URL` 是浏览器读取图片的公开地址，两者用途不同；后者不能填写内网 Endpoint。图片公开地址支持 HTTP 或 HTTPS；服务端上传 Endpoint 使用 HTTPS。
跨地域或本地开发可用官方地域公网 Endpoint，但新开通 OSS 的中国内地账号可能受公网数据 API 限制，优先在同地域 ECS 使用内网 Endpoint；若用自定义域名上传，需根据 SDK 配置增加 CNAME 支持，本版本上传配置使用标准地域 Endpoint。
不要覆盖已有的 MYSQL 密码、JWT 密钥和 IMAGE_TAG。限制配置文件权限：

```bash
chmod 600 deploy/registry/.env
```

## 5. 更新镜像并重建服务

先将代码推送 GitHub，等待镜像构建成功，服务器拉取新代码并把 `.env` 的 `IMAGE_TAG` 更新为该版本完整提交 SHA。
沿用 README 中的部署更新流程。没有 `dc` 函数时定义：

```bash
dc() { sudo docker compose --env-file deploy/registry/.env -f deploy/registry/compose.yml "$@"; }
dc pull backend nginx
dc up -d --force-recreate backend nginx
dc ps
```

两张镜像需要对应同一个 SHA，后台上传按钮与新接口才能匹配。MySQL 不需要重建或重新导入。

## 6. 验证

1. 登录 `/admin/`，新增文章，点击“选择图片并上传到阿里云 OSS”。
2. 看到封面链接自动填入、缩略图显示，确认 URL 以自己的图片域名开头。
3. 在正文点击“上传正文图片”，确认 Markdown 末尾新增图片链接，预览能显示。
4. 提交文章，打开前台确认封面及正文图片显示；在 OSS 文件管理中确认对应文件存在。
5. 说说图片同样上传验证。AI 封面还需独立配置火山引擎，普通上传不需要 AI Key。

上传成功但图片打不开：检查匿名读取权限、图片域名 CNAME 和防盗链 Referer 设置。
上传失败：先检查 Endpoint/Region/Bucket 是否对应，RAM 是否有上述目录的 PutObject 权限，以及 ECS 是否能访问对应地域 Endpoint。

本地开发：在忽略的 `application-local-secret.yml` 中添加 `aliyun.oss` 配置，参考 `application-local.example.yml`。不要将真实密钥写入示例文件。
