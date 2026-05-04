#!/bin/bash

# X Music v1.8.5 GitHub API 自动发布脚本（使用环境变量）
# 使用方法：
#   export GITHUB_TOKEN="your_token_here"
#   ./publish-release-auto.sh

set -e

VERSION="1.8.5"
REPO="lover520f/x-music"
TITLE="X Music v${VERSION} - 音效增强版"
RELEASE_DIR="/workspace/lx-music-mobile/android/app/build/outputs/apk/release"

echo "🎵 X Music v${VERSION} GitHub API 自动发布脚本"
echo "====================================="
echo ""

# 检查 token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：请先设置 GITHUB_TOKEN 环境变量"
    echo ""
    echo "使用方法："
    echo "  1. 访问 https://github.com/settings/tokens/new"
    echo "  2. 创建新的 token，勾选：repo"
    echo "  3. 复制 token 并执行："
    echo "     export GITHUB_TOKEN=\"ghp_xxxxxxxxxxxxxxxxxxxx\""
    echo "  4. 重新运行此脚本"
    echo ""
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

# 检查 APK 文件
echo "📦 检查 APK 文件..."
APK_FILES=(
    "lx-music-mobile-v${VERSION}-arm64-v8a.apk"
    "lx-music-mobile-v${VERSION}-armeabi-v7a.apk"
    "lx-music-mobile-v${VERSION}-x86_64.apk"
    "lx-music-mobile-v${VERSION}-x86.apk"
    "lx-music-mobile-v${VERSION}-universal.apk"
)

for FILE in "${APK_FILES[@]}"; do
    FILE_PATH="${RELEASE_DIR}/${FILE}"
    if [ ! -f "$FILE_PATH" ]; then
        echo "❌ 文件不存在：$FILE_PATH"
        exit 1
    fi
    SIZE=$(du -h "$FILE_PATH" | cut -f1)
    echo "  ✅ $FILE ($SIZE)"
done
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
1. **流行 (Pop)**
2. **舞曲 (Dance)**
3. **摇滚 (Rock)**
4. **古典 (Classical)**
5. **人声 (Vocal)**
6. **慢歌 (Slow)**
7. **电子 (Electronic)**
8. **低音 (Subwoofer)**
9. **柔和 (Soft)**

### 🏛️ 13 种环境音效
- 电话、教堂、大厅、影院等
- 主/效果增益独立调节

### 🔊 环绕声 + ⏩ 变调控制

## 🛠️ 技术实现
- Android 原生 AudioEffect API
- 自动初始化，实时预览

## 📱 安装说明
⚠️ 需卸载旧版本后安装
EOF
)

# 检查 release 是否已存在
echo "🔍 检查现有 Release..."
EXISTING_RELEASE=$(curl -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/tags/v${VERSION}")

if echo "$EXISTING_RELEASE" | jq -e '.id' > /dev/null 2>&1; then
    echo "⚠️  Release v${VERSION} 已存在，正在删除..."
    RELEASE_ID_TO_DELETE=$(echo "$EXISTING_RELEASE" | jq -r '.id')
    curl -s -X DELETE \
        -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO/releases/${RELEASE_ID_TO_DELETE}"
    echo "  ✅ 已删除"
    echo ""
fi

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
echo ""

# 上传 APK 文件
echo "📤 上传 APK 文件..."
UPLOADED_COUNT=0
for FILE in "${APK_FILES[@]}"; do
    FILE_PATH="${RELEASE_DIR}/${FILE}"
    echo "  上传：$FILE..."
    
    UPLOAD_RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/vnd.android.package-archive" \
        "${UPLOAD_URL}?name=${FILE}" \
        --data-binary @"$FILE_PATH")
    
    UPLOADED_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id')
    if [ "$UPLOADED_ID" != "null" ] && [ -n "$UPLOADED_ID" ]; then
        echo "    ✅ 成功 (Asset ID: $UPLOADED_ID)"
        ((UPLOADED_COUNT++))
    else
        echo "    ❌ 失败"
    fi
done

echo ""
echo "====================================="
echo "🎉 发布完成！"
echo "====================================="
echo ""
echo "📊 统计:"
echo "  - 准备文件：${#APK_FILES[@]}"
echo "  - 成功上传：$UPLOADED_COUNT"
echo ""
echo "🔗 查看 Release: https://github.com/$REPO/releases/tag/v${VERSION}"
echo ""

# 验证发布
echo "🔍 验证发布..."
FINAL_CHECK=$(curl -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/tags/v${VERSION}")

FINAL_ASSETS=$(echo "$FINAL_CHECK" | jq -r '.assets | length')
echo "  最终 Asset 数量：$FINAL_ASSETS"
echo ""
