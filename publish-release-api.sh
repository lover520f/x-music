#!/bin/bash

# X Music v1.8.5 GitHub API 自动发布脚本
# 使用 GitHub API 直接上传，无需 gh CLI

set -e

VERSION="1.8.5"
REPO="lover520f/x-music"
TITLE="X Music v${VERSION} - 音效增强版"
RELEASE_DIR="/workspace/lx-music-mobile/android/app/build/outputs/apk/release"

echo "🎵 X Music v${VERSION} GitHub API 自动发布脚本"
echo "====================================="
echo ""

# 提示输入 token
echo "🔐 请输入 GitHub Personal Access Token:"
echo "   访问 https://github.com/settings/tokens/new"
echo "   勾选：repo (Full control of private repositories)"
echo ""
read -s -p "Token: " GITHUB_TOKEN
echo ""
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：Token 不能为空"
    exit 1
fi

# 验证 token
echo "🔍 验证 Token..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/user)

if [ "$RESPONSE" != "200" ]; then
    echo "❌ Token 无效或已过期 (HTTP $RESPONSE)"
    exit 1
fi
echo "✅ Token 验证成功"
echo ""

# 创建 release notes
NOTES=$(cat << 'EOF'
## ✨ 新增功能 - 完整的音效系统

### 🎛️ 10 段均衡器
- 频率范围：31Hz - 16kHz
- 调节范围：±15dB
- 精度：0.1dB 步进
- 实时预览：调节时即时生效

### 🎵 9 种预设音效
1. **流行 (Pop)**: 增强低频和高频
2. **舞曲 (Dance)**: 强调节奏感
3. **摇滚 (Rock)**: 增强中低频
4. **古典 (Classical)**: 平衡三频
5. **人声 (Vocal)**: 突出中频人声
6. **慢歌 (Slow)**: 柔和调音
7. **电子 (Electronic)**: 强化高低频
8. **低音 (Subwoofer)**: 增强低频
9. **柔和 (Soft)**: 降低高频

### 🏛️ 13 种环境音效
- 电话、教堂、大厅、影院、餐厅等
- 主增益和效果增益独立调节

### 🔊 环绕声效果
- 虚拟环绕声技术
- 强度：1-50 可调

### ⏩ 变调控制
- 播放速度：0.5x - 2.0x

### 💾 用户自定义预设
- 最多保存 31 个均衡器预设
- 最多保存 31 个环境音效预设

## 🛠️ 技术实现
- Android 原生 AudioEffect API
- Equalizer、BassBoost、PresetReverb
- 自动初始化，实时预览

## 📱 安装说明
⚠️ 需卸载旧版本后安装
EOF
)

# 创建 release
echo "🚀 创建 GitHub Release..."
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$REPO/releases \
    -d "{
        \"tag_name\": \"v${VERSION}\",
        \"name\": \"$TITLE\",
        \"body\": $(echo "$NOTES" | jq -Rs '.'),
        \"draft\": false,
        \"prerelease\": false
    }")

# 提取 release ID
RELEASE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
UPLOAD_URL=$(echo "$CREATE_RESPONSE" | jq -r '.upload_url' | sed 's/{?name,label}//')

if [ "$RELEASE_ID" == "null" ] || [ -z "$RELEASE_ID" ]; then
    echo "❌ 创建 Release 失败"
    echo "$CREATE_RESPONSE" | jq '.'
    exit 1
fi

echo "✅ Release 创建成功 (ID: $RELEASE_ID)"
echo "📤 上传 URL: $UPLOAD_URL"
echo ""

# APK 文件列表
APK_FILES=(
    "lx-music-mobile-v${VERSION}-arm64-v8a.apk"
    "lx-music-mobile-v${VERSION}-armeabi-v7a.apk"
    "lx-music-mobile-v${VERSION}-x86_64.apk"
    "lx-music-mobile-v${VERSION}-x86.apk"
    "lx-music-mobile-v${VERSION}-universal.apk"
)

# 上传每个 APK
echo "📦 上传 APK 文件..."
for FILE in "${APK_FILES[@]}"; do
    FILE_PATH="${RELEASE_DIR}/${FILE}"
    
    if [ ! -f "$FILE_PATH" ]; then
        echo "❌ 文件不存在：$FILE_PATH"
        exit 1
    fi
    
    FILE_SIZE=$(du -h "$FILE_PATH" | cut -f1)
    echo "  上传中：$FILE ($FILE_SIZE)..."
    
    UPLOAD_RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/vnd.android.package-archive" \
        "${UPLOAD_URL}?name=${FILE}" \
        --data-binary @"$FILE_PATH")
    
    # 检查上传是否成功
    UPLOADED_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id')
    if [ "$UPLOADED_ID" == "null" ]; then
        echo "    ❌ 上传失败"
        echo "$UPLOAD_RESPONSE" | jq '.'
    else
        echo "    ✅ 上传成功 (Asset ID: $UPLOADED_ID)"
    fi
done

echo ""
echo "🎉 发布完成！"
echo ""
echo "🔗 查看 Release: https://github.com/$REPO/releases/tag/v${VERSION}"
echo ""
echo "📊 上传的文件:"
echo "====================================="
for FILE in "${APK_FILES[@]}"; do
    FILE_PATH="${RELEASE_DIR}/${FILE}"
    SIZE=$(du -h "$FILE_PATH" | cut -f1)
    echo "  - $FILE ($SIZE)"
done
echo ""
