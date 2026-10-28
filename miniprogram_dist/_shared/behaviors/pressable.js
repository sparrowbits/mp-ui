"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 可按压状态 behavior。
 *
 * Behavior() 与 Component() 同为链式风格：Behavior().data(fn).methods({...}).register()。
 * 组件侧通过 .behavior(b) 引入（链式构建器的单数方法）。
 * 混入成员在组件实例上直接可用（this.data.pressed / this.pressOn()）。
 */
exports.default = Behavior()
    .data(() => ({ pressed: false }))
    .methods({
    /** 按下反馈：置位后由调用方决定何时恢复（可配合 wx.vibrateShort） */
    pressOn() {
        this.setData({ pressed: true });
    },
    pressOff() {
        this.setData({ pressed: false });
    },
})
    .register();
