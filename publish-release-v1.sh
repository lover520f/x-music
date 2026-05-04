#!/bin/bash

# X Music v1.0.0 自动发布脚本
set -e

VERSION="1.0.0"
TITLE="X Music v${VERSION} - 全新品牌发布"
RELEASE_DIR="/workspace/lx-music-mobile/android/app/build/outputs/apk/release"

echo "🎵 X Music v${VERSION} 自动发布脚本"
echo "====================================="

# 检查 gh 是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ 错误：gh CLI 未安装"
    exit 1
fi

# 检查认证状态
echo "🔐 检查 GitHub 认证..."
if ! gh auth status &> /dev/null; then
    echo "❌ 未认证，请先运行：gh auth login"
    exit 1
fi
echo "✅ 认证成功"

# 检查 APK 文件
echo "📦 检查 APK 文件..."
APK_FILES=(
    "${RELEASE_DIR}/x-music-v${VERSION}-arm64-v8a.apk"
    "${RELEASE_DIR}/x-music-v${VERSION}-armeabi-v7a.apk"
    "${RELEASE_DIR}/x-music-v${VERSION}-x86_64.apk"
    "${RELEASE_DIR}/x-music-v${VERSION}-x86.apk"
    "${RELEASE_DIR}/x-music-v${VERSION}-universal.apk"
)

for file in "${APK_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误：文件不存在 $file"
        exit 1
    fi
    echo "  ✅ $(basename $file)"
done

# 创建 Release Notes
echo "📝 创建 Release Notes..."
NOTES=$(cat << 'EOF'
## 🎉 X Music v1.0.0 - 全新品牌发布

### ✨ 核心特性

#### 🎛️ 音效功能
- ✅ 新增音效控制功能（均衡器、低音增强、虚拟混响等）
- ✅ 播放器音效开关（复选框样式）
- ✅ 音效按钮快捷访问（点击跳转设置页面）
- ✅ 默认开启音效功能

#### 🌐 品牌升级
- ✅ 所有界面文本统一为 X Music
- ✅ WebDAV 路径更改为 /X_Music/
- ✅ 下载目录名称更新为 X-Music
- ✅ 品牌标识：X 音（中文）、X Music（英文）

### 🔧 技术改进

#### 修复
- ✅ 修复音效按钮点击跳转错误
- ✅ 修复蓝牙歌词显示问题（#1042）
- ✅ 修复品牌文本显示不一致问题

#### 优化
- ✅ 音效按钮使用正确的导航方式
- ✅ 设置页面路由优化
- ✅ 构建脚本优化（APK 文件名改为 x-music 前缀）

### 📦 安装说明

⚠️ **重要提示**：
- 从旧版本升级的用户需要手动修改 WebDAV 路径为 `/X_Music/`
- 音效功能默认开启，可在设置中关闭
- 若遇到音效相关问题，请清除应用缓存后重试

### 📊 APK 文件说明

| 文件 | 适用设备 | 大小 |
|------|---------|------|
| arm64-v8a | 绝大多数现代 Android 手机（推荐） | 23MB |
| armeabi-v7a | 老旧 32 位设备 | 22MB |
| x86_64 | 平板或模拟器 | 23MB |
| x86 | 旧款模拟器 | 23MB |
| universal | 通用版本（体积较大） | 39MB |

---

**全新开始，初心不变！** 🎵
EOF
)

# 删除旧的 Releases
echo "🗑️  删除旧的 GitHub Releases..."
for tag in $(gh release list --limit 100 --json tagName --jq '.[].tagName'); do
    echo "  删除 Release: $tag"
    gh release delete "$tag" --yes --cleanup-tag 2>/dev/null || true
done
echo "✅ 旧版本删除完成"

# 删除旧的 tag
echo "🏷️  清理旧的 tags..."
git tag -d $(git tag -l) 2>/dev/null || true
git push origin --tags --force 2>/dev/null || true
echo "✅ Tags 清理完成"

# 创建新的 tag
echo "🏷️  创建新 tag v${VERSION}..."
git tag -a "v${VERSION}" -m "X Music v${VERSION} - 全新品牌发布"
git push origin "v${VERSION}" --force

# 创建 Release
echo "🚀 创建 GitHub Release..."
gh release create "v${VERSION}" \
    --title "$TITLE" \
    --notes "$NOTES" \
    --discussion-category "Announcements" \
    "${APK_FILES[@]}"

echo ""
echo "✅ 发布成功！"
echo ""
echo "🔗 查看 Release: https://github.com/lover520f/x-music/releases/tag/v${VERSION}"
echo ""
echo "📊 上传的文件:"
echo "====================================="
for file in "${APK_FILES[@]}"; do
    SIZE=$(du -h "$file" | cut -f1)
    NAME=$(basename "$file")
    echo "  - $NAME ($SIZE)"
done
