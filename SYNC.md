# mp-ui ↔ 脚手架 同步工作流

> B 方案（git tag 版本化）下的组件迭代与双端同步约定。
> 组件开发规范见 [DEVELOPMENT.md](./DEVELOPMENT.md)，本文档只讲「改了组件之后怎么同步到脚手架」。

## 一、名词与边界

- **mp-ui（本库）**：组件唯一事实来源。路径：`/Users/silence/Projects/templates/mp-ui/`
- **脚手架**：`miniprogram-skyline-template`，消费方，只引用不改动。
- **版本号**：git tag（`vX.Y.Z`），与 `package.json` `version` 严格一致。

## 二、日常迭代（开发一个组件改动的完整闭环）

```bash
# ── 在 mp-ui 仓库 ──
cd /Users/silence/Projects/templates/mp-ui

# 1. 改组件（遵守 DEVELOPMENT.md 规范）
#    改 src/chip/... 或新增组件

# 2. 本地验证
npm run type-check && npm run lint && npm test

# 3. 升版本（自动改 package.json version）
npm version patch --no-git-tag-version

# 4. 发布（release.sh 自动：build → 提交产物 → 校验 → 打 tag → 推送）
npm run release

# ── 在脚手架仓库 ──
cd /Users/silence/Projects/templates/miniprogram

# 5. 更新依赖到新版 tag
#    改 package.json 里的 #vX.Y.Z，然后：
rm -rf node_modules/@local/mp-ui
npm install

# 6. 微信开发者工具：菜单「工具 → 构建 npm」
#    生成 miniprogram_npm/@local/mp-ui/

# 7. 验证 demo 页：pages/components-demo/
```

## 三、关键约束（踩过的坑，勿绕）

### 1. 产物必须提交进 git

`miniprogram_dist/` **不能**进 `.gitignore`。

原因：`npm i git+...` 只拉取 git 跟踪的文件，且 npm 的 `prepare` 钩子**对 git 依赖不生效**
（npm 视 git 包为"已构建"）。如果产物不入库，使用方拉到的包里根本没有组件文件。

`release.sh` 已自动完成：构建 → `git add miniprogram_dist/` → 提交 → 打 tag。

### 2. 升级版本后必须清缓存重装

npm 对 git 依赖有缓存，即使改了 tag 也可能拉到旧的。**升级 mp-ui 后必须执行：**

```bash
rm -rf node_modules/@local/mp-ui && npm install
```

如果还不生效（极端情况），清理 lockfile 中 `@local/mp-ui` 条目后重装。

### 3. 脚手架侧永不手改 miniprogram_npm

`miniprogram_npm/@local/mp-ui/` 是 DevTools「构建 npm」的产物，
任何手改都会在下次构建或重装时被覆盖。改组件永远去 mp-ui 仓库。

### 4. appid 与 token 永不入库

- mp-ui 库内 `project.config.json` 的 `appid` 固定 `touristappid`。
- `.mcp.json` 不入库。
- 脚手架侧规则见脚手架 AGENTS.md。

## 四、版本升级对脚手架的影响

| 改动类型 | 脚手架需要做什么 |
|---|---|
| 组件纯视觉优化（CSS 变量默认值） | 仅升 tag + 构建 npm |
| 组件新增 property / slot / event | 升 tag + 构建 npm + demo 页按需加用法 |
| 组件 breaking change（删属性、改事件名） | 升 tag + 构建 npm + 检查所有引用页 |
| 新增组件 | 升 tag + 构建 npm + 在 demo 页注册使用 |

**任何 breaking change 必须在 mp-ui 的 commit message 里写清迁移说明**，
脚手架侧升级时按说明改。

## 五、验证清单（每次升级后）

脚手架侧：

- [ ] `npm install` 成功，且 `ls node_modules/@local/mp-ui/miniprogram_dist/` 有组件文件
- [ ] DevTools「构建 npm」成功，无报错
- [ ] demo 页（pages/components-demo/）打开正常，组件渲染正确
- [ ] `npm run type-check` / `npm run lint` 通过
- [ ] 涉及组件的 e2e / 真机验证通过（如适用）
