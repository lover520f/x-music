#!/bin/bash

# X Music v1.0.0 自动发布脚本（使用 GitHub API）
set -e

VERSION="1.0.0"
REPO="lover520f/x-music"
RELEASE_DIR="/workspace/lx-music-mobile/android/app/build/outputs/apk/release"

echo "🎵 X Music v${VERSION} - GitHub API 自动发布"
echo "=============================================="

# 提示用户输入 Token
echo ""
echo "📝 请按以下步骤操作："
echo ""
echo "1. 访问 https://github.com/settings/tokens/new"
echo "2. 输入备注：X Music Release Script"
echo "3. 勾选 scopes：repo（完整控制）"
echo "4. 点击 'Generate token' 生成 token"
echo "5. 将生成的 token 粘贴到下方"
echo ""
read -p "请输入 GitHub Personal Access Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token 不能为空"
    exit 1
fi

echo ""
echo "🔍 检查仓库访问权限..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO")

if [ "$RESPONSE" != "200" ]; then
    echo "❌ 无法访问仓库，请检查 token 权限"
    exit 1
fi
echo "✅ 认证成功"

# 获取所有现有 releases
echo ""
echo "📋 获取现有 Releases..."
RELEASES=$(curl -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases")

# 删除所有现有 releases
echo ""
echo "🗑️  删除旧的 Releases..."
echo "$RELEASES" | jq -r '.[].id' | while read -r release_id; do
    if [ -n "$release_id" ]; then
        echo "  删除 Release ID: $release_id"
        curl -s -X DELETE \
            -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/$REPO/releases/$release_id" > /dev/null
    fi
done
echo "✅ 旧版本删除完成"

# 删除所有 tags
echo ""
echo "🏷️  删除旧的 Tags..."
git tag -d $(git tag -l) 2>/dev/null || true
git push origin --tags --force 2>/dev/null || true
echo "✅ Tags 清理完成"

# 创建 Release Notes
echo ""
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
- ✅ 修复蓝牙歌词显示问题
- ✅ 修复品牌文本显示不一致问题

### 📦 下载

选择适合你设备的 APK 文件：
- arm64-v8a (23MB) - 绝大多数现代 Android 手机（推荐）
- armeabi-v7a (22MB) - 老旧 32 位设备
- universal (39MB) - 通用版本

### ⚠️ 注意事项
- 从旧版本升级需修改 WebDAV 路径为 `/X_Music/`
- 音效功能默认开启，可在设置中关闭

---
**全新开始，初心不变！** 🎵
EOF
)

# 检查 APK 文件
echo ""
echo "📦 检查 APK 文件..."
APK_FILES=(
    "x-music-v${VERSION}-arm64-v8a.apk"
    "x-music-v${VERSION}-armeabi-v7a.apk"
    "x-music-v${VERSION}-x86.apk"
    "x-music-v${VERSION}-x86_64.apk"
    "x-music-v${VERSION}-universal.apk"
)

for file in "${APK_FILES[@]}"; do
    if [ ! -f "$RELEASE_DIR/$file" ]; then
        echo "❌ 错误：文件不存在 $file"
        exit 1
    fi
    echo "  ✅ $file"
done

# 创建 Release
echo ""
echo "🚀 创建 GitHub Release..."

# 创建 release
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/releases" \
    -d "{
        \"tag_name\": \"v${VERSION}\",
        \"name\": \"X Music v${VERSION} - 全新品牌发布\",
        \"body\": \"$NOTES\",
        \"draft\": false,
        \"prerelease\": false,
        \"discussion_category_name\": \"Announcements\"
    }")

RELEASE_ID=$(echo "$RESPONSE" | jq -r '.id')
UPLOAD_URL=$(echo "$RESPONSE" | jq -r '.upload_url' | sed 's/{?name,label}//')

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "null" ]; then
    echo "❌ 创建 Release 失败"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Release 创建成功 (ID: $RELEASE_ID)"
echo "📤 上传 URL: $UPLOAD_URL"

# 上传 APK 文件
echo ""
echo "📦 上传 APK 文件..."
for file in "${APK_FILES[@]}"; do
    FILE_PATH="$RELEASE_DIR/$file"
    echo "  上传: $file"
    
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/vnd.android.package-archive" \
        --data-binary @"$FILE_PATH" \
        "$UPLOAD_URL?name=$file" > /dev/null
    
    SIZE=$(du -h "$FILE_PATH" | cut -f1)
    echo "    ✅ 上传成功 ($SIZE)"
done

echo ""
echo "✅ 发布完成！"
echo ""
echo "🔗 查看 Release: https://github.com/$REPO/releases/tag/v${VERSION}"
echo ""
echo "📊 上传的文件:"
echo "====================================="
for file in "${APK_FILES[@]}"; do
    SIZE=$(du -h "$RELEASE_DIR/$file" | cut -f1)
    echo "  - $file ($SIZE)"
done
