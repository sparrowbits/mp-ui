# mp-ui 组件库开发规范 v1.0

> 本文档是 mp-ui 组件库的**唯一开发准则**。所有组件、工具函数、样式在提交前必须逐条核对。
> 与模板脚手架（miniprogram-skyline-template）的关系：脚手架通过 git tag 版本化引入本库，
> 组件演进以本库为准，脚手架只做消费。任何"为了脚手架方便"而破坏本规范约定的改动必须先改规范。

---

## 1. 技术栈与边界

| 项 | 约定 |
|---|---|
| 技术栈 | 原生小程序 + TypeScript + **glass-easel 链式 API** + Skyline 优先 |
| 零运行时依赖 | 库本身不依赖任何 npm runtime 包 |
| 双渲染器 | 每个组件标注「Skyline only」或「双渲染器」，双渲染器必须经 WebView e2e 验证 |
| 包结构 | `miniprogram_dist/` 为发布产物，源码 `src/` |

硬边界（违反即打回）：

- **组件源码内只允许 import `_shared/` 内的模块**，禁止引用 `_shared` 之外的相对路径。
- 不引入构建期框架（Taro / uni-app）、不引入组件库依赖。
- `.mcp.json`、密钥、真实 appid 永不进入本库（库内 `appid` 固定 `touristappid`）。

---

## 2. 组件命名（扁平 + 前缀）

所有组件**扁平**放在 `src/` 下，每个组件一个目录，目录名即组件名。

### 2.1 目录与标签名

```
src/
  chip/           →  <mp-chip />
  nav-bar/        →  <mp-nav-bar />
  dialog/         →  <mp-dialog />
  _shared/        ←  内部共享，不对外，无组件
```

- 使用方声明：`"mp-chip": "@scope/mp-ui/chip/index"`，标签用 `<mp-chip>`。
- **目录名用全小写中划线（kebab-case），不得用大写或下划线**。
- **公共 API 必须带 `mp-` 前缀**（`usingComponents` key、标签名、CSS 变量前缀 `--mp-*`、事件名 `bind:mp*`，统一用 `mp` 标识命名空间）。
- **属性、方法、事件不带 `mp-` 前缀**（如 `visible`、`onAgree`），它们是组件私有的，不属于命名空间。

> 为什么扁平：组件数 <20 时子目录分类是过度设计；kebab-case 目录名天然充当命名空间。

### 2.2 命名约定速查

| 项 | 约定 | 示例 |
|---|---|---|
| 目录 / 标签 | kebab-case | `nav-bar`、`<mp-nav-bar>` |
| 组件 property | camelCase | `visible`, `customStyle` |
| 事件名 | camelCase，不带 on 前缀 | `bind:agree`, `bind:close` |
| 内部方法 / data 字段 | camelCase，下划线表私有 | `onAgree`, `_timer` |
| CSS 变量 | `--mp-组件名-语义` | `--mp-chip-bg` |
| externalClass | kebab-case | `ext-class`, `ext-mask-class` |

---

## 3. 样式：CSS 变量优先

**核心约定：所有视觉 token 必须走 CSS 变量（`var(--x, fallback)`），禁止写死色值/间距。**

```wxss
/* ✅ 正确 */
.mp-chip {
  background: var(--mp-chip-bg, #f5f5f5);
  color: var(--mp-chip-color, #333);
  padding: var(--mp-chip-padding-y, 8rpx) var(--mp-chip-padding-x, 16rpx);
}

/* ❌ 错误：写死值，使用方无法主题化 */
.mp-chip {
  background: #f5f5f5;
}
```

### 3.1 CSS 变量命名

- 前缀 `--mp-` + 组件名 + 语义词，全小写中划线。
- **每个组件必须在 README 列出全部变量清单**（见 §9）。
- 变量必须有**合理的 fallback 默认值**，保证不注入变量时组件可用。

### 3.2 样式隔离三件套

每个组件**必须**显式声明以下三项，缺一不可：

```ts
Component()
  .options({
    styleIsolation: 'isolated',   // 或 'apply-shared'（见下）
    virtualHost: true,
    multipleSlots: true,          // 有多个 slot 才开，否则省略
  })
  .definition({
    externalClasses: ['ext-class'], // 至少一个，见 §3.3
  })
```

- `virtualHost: true` **强制开启**——宿主节点虚拟化，布局无多余包装层。
  代价：使用方写在标签上的 `class` / `style` 会失效，**必须**由 `ext-class` 承接。
- `styleIsolation`：
  - `isolated`（默认）——样式完全隔离，推荐。
  - `apply-shared`——允许页面 wxss 影响组件内部，仅在确实需要时使用，
    且必须同时在 README 说明「此组件样式可被页面覆写」。

### 3.3 externalClasses 契约

每个组件**必须**提供至少一个 `ext-class`，并写清它挂在内部哪个节点：

| externalClass | 挂载节点 | 用途 |
|---|---|---|
| `ext-class` | 根节点 `.mp-chip` | 覆写组件主体样式 |
| `ext-mask-class` | 蒙层节点 `.mp-dialog-mask` | 覆写蒙层 |

> 提供 `ext-class` 后，使用方可在 `<mp-chip ext-class="my-class" />` 注入自定义类，
> 配合 CSS 变量实现"不改源码即可换肤"。

### 3.4 动态样式注入

需要传任意样式串（如动态背景色）时，用同名 `customStyle` 的 property 手动绑定到内部节点：

```ts
.property('customStyle', { type: String, value: '' })
```

```wxml
<view class="mp-chip ext-class" style="{{customStyle}}">
```

> ⚠️ `virtualHost` 下 `style` 属性写在标签上不生效，必须由组件内部显式绑定。

---

## 4. 扩展性设计（property / slot / event 三层）

组件的扩展性由**三层 API** 承载，设计时按此顺序评估：

| 层 | 机制 | 适用 |
|---|---|---|
| 数据 | `property()` 传值 | 文本、状态、配置项 |
| 结构 | `slot`（具名 / 默认） | 内容替换、布局注入 |
| 行为 | `triggerEvent()` 抛事件 | 用户操作反馈 |

**约定：**

1. **命名 slot 优先**：内容型区域（图标、标题后缀、操作按钮）用具名 slot，
   让使用方完全控制渲染，而不是加一堆 `xxxIcon` property。
2. **property 最小化**：只保留真正影响组件**行为**的属性。
   纯视觉定制交给 CSS 变量 + `ext-class`，不要加 `bgColor` / `textColor` 这类 property。
3. **事件全抛**：所有可交互元素必须抛事件（`bind:agree`、`bind:close` 等），
   不得只在内部处理。事件对象里带上必要上下文。
4. **forward ref 能力**：复杂组件（如表单类）应暴露方法供使用方调用
   （如 `this.selectComponent('#xxx').open()`），在 README 写清。

---

## 5. 双渲染器承诺

每个组件在 `src/<name>/README.md` 头部标注渲染器支持等级：

| 等级 | 含义 | 验证要求 |
|---|---|---|
| `Skyline only` | 用了 Skyline 专属 API（worklet、共享元素、scroll-view 增强等） | 无需 WebView 测试 |
| `双渲染器` | 纯 WXML + 标准事件，无 Skyline 专属依赖 | 必须通过 WebView e2e |

**任何标注「双渲染器」的组件，必须在本库 e2e 套件里跑通 WebView 模式**（`renderer: 'webview'` 页面），
不得仅凭"代码看起来兼容"就标注。

---

## 6. 目录结构

```
mp-ui/
  src/
    _shared/               # 内部共享：behaviors、工具、主题变量
      behaviors/
        pressable.ts
      styles/
        tokens.wxss        # 可选：跨组件的 fallback 默认值
      utils/
    chip/
      index.ts
      index.wxml
      index.wxss
      index.json
      README.md            # 每个组件必须有
    nav-bar/
    ...
  scripts/
    build.js               # TS → JS 打包 + 拷贝 wxml/wxss/json
    release.sh             # git tag + 版本检查
  tests/
    unit/                  # miniprogram-simulate 单元测试
    e2e/                   # miniprogram-automator e2e（Skyline + WebView）
  DEVELOPMENT.md           # 本规范 + 工作流
  package.json             # "miniprogram": "miniprogram_dist"
  tsconfig.json
```

---

## 7. 发布（git tag 版本化）

**发布产物是 `miniprogram_dist/`，由源码构建生成，发布时打上 git tag。**

### 7.1 版本号

- 语义化版本 `MAJOR.MINOR.PATCH`。
- tag 格式：`v1.2.3`（必须带 `v` 前缀，与 package.json `version` 严格一致）。
- **每次发布前 `scripts/release.sh` 自动校验** tag 与 package.json 一致、产物已构建。

### 7.2 发布流程

```bash
# 1. 开发完成，跑通测试
npm test && npm run type-check

# 2. 更新版本号
npm version patch   # 或 minor / major

# 3. 构建产物
npm run build

# 4. 打 tag 并推送（release.sh 会做一致性校验）
./scripts/release.sh
```

### 7.3 使用方引入（B 方案）

脚手架 `package.json`：

```json
"dependencies": {
  "@scope/mp-ui": "git+file:../mp-ui#v0.1.0"
}
```

DevTools「工具 → 构建 npm」后即可 `usingComponents` 引入。

---

## 8. 双端同步工作流

**职责划分：**

- **mp-ui（本库）**：组件的唯一事实来源，负责组件源码、构建、测试、发布 tag。
- **脚手架（miniprogram-skyline-template）**：消费方，持有 `package.json` 里的组件库版本号和 demo 页。

**同步更新流程：**

1. mp-ui 仓库改组件 → 构建 → 跑测试 → `npm version` → `release.sh` 打 tag。
2. 脚手架侧升级版本号：`npm i git+file:../mp-ui#v0.2.0`。
3. DevTools「构建 npm」。
4. 脚手架跑通自身 e2e（如有组件 demo 页受影响）。

**脚手架永远不直接改 `miniprogram_npm/` 下的组件代码**——那是产物，改了也会被下次 `npm i` 覆盖。

---

## 9. 组件 README 模板

每个组件的 `src/<name>/README.md` 必须包含：

```markdown
# <组件名> <mp-xxx>

> 渲染器支持：Skyline only / 双渲染器

## 用法

```json
{ "usingComponents": { "mp-xxx": "@scope/mp-ui/xxx/index" } }
```

```wxml
<mp-xxx prop="value" bind:event="onEvent" />
```

## API

### Properties

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| visible | Boolean | false | 是否显示 |

### Events

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| agree | 点击同意 | - |

### Slots

| 名称 | 说明 |
|---|---|
| default | 默认内容 |

### externalClasses

| 类名 | 挂载节点 |
|---|---|
| ext-class | 根节点 |

### CSS 变量

| 变量名 | 默认值 | 说明 |
|---|---|---|
| --mp-xxx-bg | #fff | 背景色 |
```

---

## 10. 提交前检查清单

每个 PR 必须确认：

- [ ] 组件内所有 import 都在 `_shared/` 内
- [ ] 所有视觉 token 走 CSS 变量（`var(--x, fallback)`），无写死值
- [ ] `options` 显式声明 `styleIsolation`、`virtualHost`
- [ ] 至少一个 `externalClass` 且 README 写清挂载节点
- [ ] property / slot / event 三层 API 设计完整
- [ ] 渲染器支持等级已标注，双渲染器组件已过 WebView e2e
- [ ] 组件 README 按 §9 模板填写完整（含全部 CSS 变量清单）
- [ ] `npm run type-check` / `npm run lint` / `npm test` 全绿
