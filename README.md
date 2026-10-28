# mp-ui

原生小程序组件库：TypeScript + glass-easel 链式 API + Skyline 优先。

- 开发规范（唯一准则）：[DEVELOPMENT.md](./DEVELOPMENT.md)
- 发布方式：git tag 版本化（B 方案，使用方 `npm i git+file:../mp-ui#vX.Y.Z`）
- 产物目录：`miniprogram_dist/`（源码 `src/` 经 `npm run build` 生成）

## 快速开始（开发）

```bash
npm install
npm run type-check && npm run lint   # 提交前必过
npm run build                        # 生成 miniprogram_dist/
npm run release                      # 打 tag 并推送（需先 npm version）
```

## 组件一览

| 组件 | 目录 | 渲染器 | 说明 |
|---|---|---|---|
| `<mp-chip>` | `src/chip/` | 双渲染器 | 标签 / 徽标 |

## 在脚手架中引入

```bash
# 脚手架项目根目录
npm i git+file:../mp-ui#v0.1.0
```

DevTools「工具 → 构建 npm」后即可 `usingComponents` 引入。

## 同步更新

见 [DEVELOPMENT.md §8 双端同步工作流](./DEVELOPMENT.md#8-双端同步工作流)。
