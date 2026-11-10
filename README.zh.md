# dsh-static-token

为 DeepSeek Harness (DSH) Web GUI 配置一个**固定的持久化启动令牌 (launch token)**，防止因反向代理配置或远程设备访问导致的会话过期和认证问题。

---

## 问题背景

默认情况下，DSH 在每次服务启动时都会生成一个瞬态、仅存在于内存中的启动令牌。在无头 (headless)、反向代理 (reverse-proxy) 或容器化部署（如 Kubernetes 集成 Traefik/Authentik）环境下，重启进程会导致当前令牌失效。同时，从其他设备（如手机）访问看板时，通常需要从服务器日志中手动获取新令牌。

## 解决方案

`dsh-static-token` 通过钩子接入 `connection` 服务，使用通过环境变量或插件配置定义的固定令牌，覆盖系统自动生成的随机令牌。

---

## 核心功能

- **固定启动令牌：** 在服务重启或主机重启后，依然保持令牌不变。
- **最小长度校验：** 强制要求令牌至少 16 字符，避免弱口令导致弱认证。
- **高优先级环境变量：** 优先读取进程环境变量 `DSH_WEB_TOKEN`，支持配置文件作为降级方案。
- **无缝集成反向代理：** 简化书签管理或 Forward-auth 配置，无需频繁查看服务器日志。
- **零开销：** 纯 ESM 实现，无外部运行时依赖，资源占用极小。

---

## 安全与架构注意事项

1. **口令强度：** 启动时会校验令牌长度，少于 16 字符将报错拒绝启动。建议使用长随机字符（如 `openssl rand -hex 24`）。
2. **反向代理与 Host 校验：** 在反向代理（如 Traefik、Nginx、Caddy）场景下，宿主 DSH 原生 connection 服务要求将代理域名配置在宿主的 `trustedHosts` 中。本插件仅负责令牌配置，不负责 Host 头部鉴权设置。
3. **宿主私有字段说明：** 本插件通过改写宿主内部字段（`ctx.connection.browserAuth.launchToken`）实现。若上游 DSH 对 connection 内部架构进行大版本重构，可能需要适配更新。

---

## 安装说明

### 使用 DSH CLI 安装

```bash
dsh plugin --profile web add dsh-static-token
```

### 从本地源码安装

```bash
git clone https://github.com/mdalboni/dsh-static-token.git
dsh plugin --profile web add link:./dsh-static-token
```

---

## 配置方式

你可以通过以下两种方式提供固定令牌：

### 1. 环境变量（推荐：Systemd / 容器部署）

在环境或服务定义中设置 `DSH_WEB_TOKEN`：

```bash
export DSH_WEB_TOKEN="your-custom-secure-token-here"
```

在 **systemd 服务** (如 `/etc/systemd/system/dsh.service`) 中：

```ini
[Service]
Environment="DSH_WEB_TOKEN=your-custom-secure-token-here"
```

### 2. 插件配置

直接在 DSH 配置文件中定义：

```yaml
# cordis.patch.yml 或 profile 配置文件
dsh-static-token:
  token: "your-custom-secure-token-here"
```

---

## 使用

配置生效并重启服务后，通过以下 URL 即可完成新设备或浏览器的认证：

```
https://your-dsh-domain.com/?token=your-custom-secure-token-here
```

DSH 将设置标准的 30 天会话 Cookie，并重定向至干净的 URL。

---

## 测试

使用 Node.js 运行内置测试：

```bash
node test.js
```

---

## 许可协议

MIT © Maxwell Dalboni
