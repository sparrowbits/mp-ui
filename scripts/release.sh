#!/usr/bin/env sh
# mp-ui 发布脚本：校验 tag 与 package.json 一致、产物已构建，然后打 tag 推送。
# 用法：npm run release（确保已先 npm version <patch|minor|major> && npm run build）
set -e

PKG_VERSION=$(node -p "require('./package.json').version")
TAG="v$PKG_VERSION"

# 1. 校验产物已构建（发布的是 miniprogram_dist，不是 src）
if [ ! -d "miniprogram_dist" ] || [ -z "$(ls -A miniprogram_dist 2>/dev/null)" ]; then
  echo "❌ miniprogram_dist/ 不存在或为空，请先 npm run build"
  exit 1
fi

# 2. 校验工作区干净
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区有未提交改动，请先 commit："
  git status --short
  exit 1
fi

# 3. 校验 tag 不存在
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "❌ tag $TAG 已存在，请先用 npm version 升版本"
  exit 1
fi

echo "✔ 校验通过，发布 $TAG"
git tag -a "$TAG" -m "release $TAG"
git push origin "$TAG"
echo "✔ 已推送 tag $TAG，使用方执行：npm i git+file:../mp-ui#$TAG"
