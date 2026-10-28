# chip（`<mp-chip>`）

> 渲染器支持：**双渲染器**（纯 WXML + 标准事件，无 Skyline 专属依赖）

标签 / 徽标，支持语义色调、按压反馈、外部类换肤。

## 用法

```json
{ "usingComponents": { "mp-chip": "@local/mp-ui/chip/index" } }
```

```wxml
<mp-chip text="标签" tone="brand" ext-class="my-chip" bind:tap="onChipTap" />
```

## API

### Properties

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| text | String | `''` | 标签文案 |
| tone | String | `'plain'` | 语义色调：`brand` / `info` / `warn` / `plain` |

### Events

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| tap | 点击标签 | `{ taps: number }` 累计点击次数 |

### Slots

| 名称 | 说明 |
|---|---|
| default | 暂无（保留扩展） |

### externalClasses

| 类名 | 挂载节点 |
|---|---|
| ext-class | 根节点 `.mp-chip` |

### CSS 变量

| 变量名 | 默认值 | 说明 |
|---|---|---|
| --mp-chip-padding-y | `6rpx` | 纵向内边距 |
| --mp-chip-padding-x | `20rpx` | 横向内边距 |
| --mp-chip-radius | `999rpx` | 圆角 |
| --mp-chip-gap | `12rpx` | 右侧间距 |
| --mp-chip-font-size | `22rpx` | 字号 |
| --mp-chip-color | `#374151` | 文字颜色 |
| --mp-chip-brand-bg | `rgba(7,193,96,.12)` | brand 色调背景 |
| --mp-chip-info-bg | `rgba(16,174,255,.12)` | info 色调背景 |
| --mp-chip-warn-bg | `rgba(250,157,59,.16)` | warn 色调背景 |
| --mp-chip-plain-bg | `rgba(0,0,0,.05)` | plain 色调背景 |
| --mp-chip-pressed-opacity | `0.6` | 按压态透明度 |
