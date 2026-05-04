# X Music v1.0.0 手动发布指南

## 前置准备

✅ 代码已推送到 GitHub：
- 已完成 `git push --force origin main`
- 源码已在 https://github.com/lover520f/x-music

## 发布步骤

### 方法 1: 使用 GitHub Web 界面（推荐）

#### 1. 删除旧的 Releases

1. 访问 https://github.com/lover520f/x-music/releases/
2. 点击每个旧版本的 "Delete" 按钮
3. 确认删除

#### 2. 删除旧的 Tags

1. 访问 https://github.com/lover520f/x-music/tags/
2. 点击每个旧 tag 右侧的 "✕" 删除

#### 3. 创建新的 Release

1. 访问 https://github.com/lover520f/x-music/releases/new

2. 填写以下信息：

**Tag version**: `v1.0.0`

**Target**: `main`

**Release title**: `X Music v1.0.0 - 全新品牌发布`

**Description**: 
```markdown
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
- `x-music-v1.0.0-arm64-v8a.apk` (23MB) - 绝大多数现代 Android 手机（推荐）
- `x-music-v1.0.0-armeabi-v7a.apk` (22MB) - 老旧 32 位设备
- `x-music-v1.0.0-universal.apk` (39MB) - 通用版本（体积较大）

### ⚠️ 注意事项

- 从旧版本升级需修改 WebDAV 路径为 `/X_Music/`
- 音效功能默认开启，可在设置中关闭
```

3. 上传 APK 文件（在底部 "Attach binaries"）:
   - 从 `/workspace/lx-music-mobile/android/app/build/outputs/apk/release/` 目录上传以下文件：
     - `x-music-v1.0.0-arm64-v8a.apk`
     - `x-music-v1.0.0-armeabi-v7a.apk`
     - `x-music-v1.0.0-universal.apk`
     - `x-music-v1.0.0-x86.apk`
     - `x-music-v1.0.0-x86_64.apk`

4. 勾选 "Set as the latest release"

5. 点击 "Publish release"

### 方法 2: 使用 GitHub CLI

如果已安装 gh CLI，执行以下命令：

```bash
cd /workspace/lx-music-mobile

# 1. 认证
gh auth login

# 2. 删除所有旧 Releases
gh release list | cut -f3 | xargs -I {} gh release delete {} --yes --cleanup-tag

# 3. 删除本地所有 tags
git tag -d $(git tag -l)

# 4. 推送 tags 删除到远程
git push origin --tags --force

# 5. 创建新 tag 并推送
git tag -a "v1.0.0" -m "X Music v1.0.0 - 全新品牌发布"
git push origin "v1.0.0" --force

# 6. 创建 Release 并上传 APK
cd /workspace/lx-music-mobile/android/app/build/outputs/apk/release/
gh release create v1.0.0 \
  --title "X Music v1.0.0 - 全新品牌发布" \
  --notes "## 🎉 X Music v1.0.0 - 全新品牌发布" \
  --discussion-category "Announcements" \
  x-music-v1.0.0-arm64-v8a.apk \
  x-music-v1.0.0-armeabi-v7a.apk \
  x-music-v1.0.0-universal.apk \
  x-music-v1.0.0-x86.apk \
  x-music-v1.0.0-x86_64.apk
```

## 验证发布

1. 访问 https://github.com/lover520f/x-music/releases/tag/v1.0.0
2. 确认所有 APK 文件已上传
3. 检查 Release Notes 显示正确

## 完成！✅

**X Music v1.0.0 发布成功！** 🎉🎵
