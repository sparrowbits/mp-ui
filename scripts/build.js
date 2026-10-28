#!/usr/bin/env node
/**
 * mp-ui 构建脚本：把 src/ 编译到 miniprogram_dist/。
 *
 * 微信小程序 npm 包不支持把 TS 源码交给 DevTools 编译（DevTools 只编译使用方的 tsconfig），
 * 所以组件库的 TS 必须在发布前转译成 JS，wxml/wxss/json 原样拷贝。
 *
 * 产出目录结构：
 *   miniprogram_dist/
 *     chip/index.js        ← tsc 转译
 *     chip/index.wxml      ← 原样拷贝
 *     chip/index.wxss
 *     chip/index.json
 *     ...
 */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const OUT = path.join(ROOT, 'miniprogram_dist')

/** 递归拷贝目录 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// 1. 清空旧产物
fs.rmSync(OUT, { recursive: true, force: true })

// 2. 全量拷贝（含 wxml/wxss/json/README），随后把 .ts 就地转译成 .js
copyDir(SRC, OUT)
execSync(`npx tsc -p ${JSON.stringify(ROOT)} --outDir ${JSON.stringify(OUT)} --noEmit false`, {
  stdio: 'inherit',
})

// 3. tsc 不会删除源 .ts，产物里必须只留 .js（避免使用方 tsc 重复编译）
function stripTs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) stripTs(p)
    else if (entry.name.endsWith('.ts')) fs.rmSync(p)
  }
}
stripTs(OUT)

console.log(`✔ 构建完成 → ${path.relative(ROOT, OUT)}/`)
