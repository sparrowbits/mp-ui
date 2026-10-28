/**
 * 标签 / 徽标（mp-chip）。
 *
 * 渲染器支持：双渲染器（纯 WXML + 标准事件，无 Skyline 专属依赖）
 *
 * 定制三层：
 * - 数据：text / tone 两个 property 决定内容与语义色；
 * - 结构：默认 slot 可替换内部文案（保留 text 作为快捷方式）；
 * - 样式：CSS 变量（--mp-chip-*）+ ext-class。
 *
 * 所有视觉 token 见 index.wxss 的 var(--mp-chip-*, fallback)，
 * 变量清单见 README.md，使用方在页面 wxss 注入变量即可换肤。
 */
import pressable from '../_shared/behaviors/pressable'

Component()
  .behavior(pressable)
  .options({ styleIsolation: 'isolated', virtualHost: true, multipleSlots: true })
  .definition({
    externalClasses: ['ext-class'],
  })
  .property('text', { type: String, value: '' })
  /** 语义色调：brand / info / warn / plain */
  .property('tone', { type: String, value: 'plain' })
  .data(() => ({
    taps: 0,
  }))
  .methods({
    onTap() {
      const taps = this.data.taps + 1
      this.setData({ taps })
      this.pressOn()
      // pressable 混入成员：this.pressOn / this.pressOff
      setTimeout(() => this.pressOff(), 150)
      // 所有可交互元素必须抛事件（规范 §4.3）
      this.triggerEvent('tap', { taps })
    },
  })
  .register()
