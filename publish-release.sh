#!/bin/bash

# X Music v1.8.5 自动发布脚本
# 使用前请确保已安装 gh CLI 并认证

set -e

VERSION="1.8.5"
TITLE="X Music v${VERSION} - 音效增强版"
RELEASE_DIR="/workspace/lx-music-mobile/android/app/build/outputs/apk/release"
PROJECT_DIR="/workspace/lx-music-mobile"

echo "🎵 X Music v${VERSION} 自动发布脚本"
echo "====================================="
echo ""

# 检查 gh 是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ 错误：gh CLI 未安装"
    echo "请运行：sudo apt-get install gh 或访问 https://cli.github.com/"
    exit 1
fi

# 检查认证状态
echo "🔐 检查 GitHub 认证..."
if ! gh auth status &> /dev/null; then
    echo "❌ 未认证，请先运行：gh auth login"
    echo ""
    gh auth login
fi

echo "✅ 认证成功"
echo ""

# 检查 APK 文件是否存在
echo "📦 检查 APK 文件..."
APK_FILES=(
    "${RELEASE_DIR}/lx-music-mobile-v${VERSION}-arm64-v8a.apk"
    "${RELEASE_DIR}/lx-music-mobile-v${VERSION}-armeabi-v7a.apk"
    "${RELEASE_DIR}/lx-music-mobile-v${VERSION}-x86_64.apk"
    "${RELEASE_DIR}/lx-music-mobile-v${VERSION}-x86.apk"
    "${RELEASE_DIR}/lx-music-mobile-v${VERSION}-universal.apk"
)

for file in "${APK_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误：文件不存在 $file"
        exit 1
    fi
    echo "  ✅ $(basename $file)"
done
echo ""

# 创建 release notes
echo "📝 创建 Release Notes..."
NOTES=$(cat << 'EOF'
## ✨ 新增功能 - 完整的音效系统

### 🎛️ 10 段均衡器
- 频率范围：31Hz - 16kHz
- 调节范围：±15dB
- 精度：0.1dB 步进
- 实时预览：调节时即时生效

### 🎵 9 种预设音效
1. **流行 (Pop)**: 增强低频和高频，适合流行音乐
2. **舞曲 (Dance)**: 强调节奏感，适合电子舞曲
3. **摇滚 (Rock)**: 增强中低频，适合摇滚乐
4. **古典 (Classical)**: 平衡三频，适合古典音乐
5. **人声 (Vocal)**: 突出中频人声，适合声乐作品
6. **慢歌 (Slow)**: 柔和调音，适合抒情歌曲
7. **电子 (Electronic)**: 强化高低频，适合电子乐
8. **低音 (Subwoofer)**: 增强低频，适合低音爱好者
9. **柔和 (Soft)**: 降低高频，柔和听感

### 🏛️ 13 种环境音效（混响）
- 电话、教堂、大厅、影院、餐厅、浴室、室内、立体声等
- 模拟不同空间的声学特性
- 主增益和效果增益独立调节

### 🔊 环绕声效果
- 虚拟环绕声技术
- 强度：1-50 可调
- 距离：1-30 可调

### ⏩ 变调控制
- 播放速度：0.5x - 2.0x
- 无级变速

### 💾 用户自定义预设
- 最多保存 31 个自定义均衡器预设
- 最多保存 31 个自定义环境音效预设

## 🛠️ 技术实现
- Android 原生 AudioEffect API
- Equalizer（均衡器）、BassBoost（低音增强）、PresetReverb（混响）
- 自动初始化音效模块
- 实时预览，设置持久化

## 📱 安装说明
⚠️ **重要**: 由于签名变更，需要：
1. 备份播放列表和设置
2. 卸载旧版本
3. 安装新版本 v1.8.5

### 架构选择
- **arm64-v8a**: 绝大多数现代 Android 手机（推荐）
- **armeabi-v7a**: 老旧 32 位设备
- **x86_64**: 平板或模拟器
- **x86**: 旧款模拟器
- **universal**: 通用版本（体积较大）
EOF
)

echo ""
echo "🚀 创建 GitHub Release..."

# 删除已存在的 tag（如果存在）
if gh release view "v${VERSION}" &> /dev/null; then
    echo "⚠️  Release v${VERSION} 已存在，正在删除..."
    gh release delete "v${VERSION}" --yes --cleanup-tag || true
fi

# 创建 release
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

# 显示文件信息
echo "📊 上传的文件:"
echo "====================================="
for file in "${APK_FILES[@]}"; do
    SIZE=$(du -h "$file" | cut -f1)
    NAME=$(basename "$file")
    echo "  - $NAME ($SIZE)"
done
