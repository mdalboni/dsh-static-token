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
- **高优先级环境变量：** 优先读取进程环境变量 `DSH_WEB_TOKEN`，支持配置文件作为降级方案。
- **无缝集成反向代理：** 简化书签管理或 Forward-auth 配置，无需频繁查看服务器日志。
- **零开销：** 纯 ESM 实现，无外部运行时依赖，资源占用极小。

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
