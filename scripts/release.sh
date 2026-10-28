#!/usr/bin/env sh
# mp-ui 发布脚本：构建产物 → 提交产物 → 打 tag → 推送。
#
# ⚠️ B 方案（git tag 版本化）的关键约束：npm i git+... 只拉 git 跟踪的文件，
#    prepare 钩子对 git 依赖不生效。因此 miniprogram_dist/ 产物必须提交进 git，
#    使用方才能拿到组件文件。
#
# 用法：npm run release（内部自动执行 build，无需先手动 build）
set -e

PKG_VERSION=$(node -p "require('./package.json').version")
TAG="v$PKG_VERSION"

echo "▶ 步骤 1/4：构建产物"
npm run build

# 2. 产物必须存在且非空
if [ ! -d "miniprogram_dist" ] || [ -z "$(ls -A miniprogram_dist 2>/dev/null)" ]; then
  echo "❌ miniprogram_dist/ 构建失败"
  exit 1
fi

echo "▶ 步骤 2/4：提交产物（B 方案要求产物进 git）"
git add miniprogram_dist/
if ! git diff --cached --quiet; then
  git commit -m "chore(release): 构建产物 $TAG

Co-Authored-By: Claude Code <noreply@anthropic.com>"
fi

echo "▶ 步骤 3/4：校验 tag 一致性"
if [ -n "$(git status --porcelain -- . ':(exclude)node_modules')" ]; then
  echo "❌ 仍有未提交改动，请先处理："
  git status --short
  exit 1
fi
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "❌ tag $TAG 已存在，请先 npm version <patch|minor|major>"
  exit 1
fi

echo "▶ 步骤 4/4：打 tag 并推送"
git tag -a "$TAG" -m "release $TAG"
git push origin "$TAG" 2>/dev/null || echo "  （无远程，仅本地 tag）"
echo "✔ 已发布 $TAG，使用方执行：npm i git+file:///path/to/mp-ui#$TAG"
