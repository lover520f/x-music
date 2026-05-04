# X Music v1.8.5 发布指南

## 📦 APK 文件已准备就绪

所有 APK 文件已生成并重命名为 v1.8.5：

```
/workspace/lx-music-mobile/android/app/build/outputs/apk/release/
├── lx-music-mobile-v1.8.5-arm64-v8a.apk (23MB)
├── lx-music-mobile-v1.8.5-armeabi-v7a.apk (22MB)
├── lx-music-mobile-v1.8.5-universal.apk (39MB)
├── lx-music-mobile-v1.8.5-x86.apk (23MB)
└── lx-music-mobile-v1.8.5-x86_64.apk (23MB)
```

## 🚀 自动发布（推荐）

### 步骤 1：获取 GitHub Token

1. 访问：https://github.com/settings/tokens/new
2. 点击 "Generate new token (classic)"
3. 勾选权限：`repo` (Full control of private repositories)
4. 点击 "Generate token"
5. 复制生成的 token（以 `ghp_` 开头）

### 步骤 2：执行发布脚本

```bash
# 设置环境变量
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 执行自动发布脚本
cd /workspace/lx-music-mobile
./publish-release-auto.sh
```

脚本会：
- ✅ 验证 Token
- ✅ 检查 APK 文件
- ✅ 创建 GitHub Release v1.8.5
- ✅ 上传所有 5 个 APK 文件
- ✅ 显示发布结果

## 📝 手动发布

如果不想使用自动脚本，可以手动发布：

### 方法 1：使用 GitHub Web 界面

1. 访问：https://github.com/lover520f/x-music/releases/new
2. Tag version: `v1.8.5`
3. Release title: `X Music v1.8.5 - 音效增强版`
4. 填入 release notes（见下方）
5. 上传 5 个 APK 文件
6. 点击 "Publish release"

### 方法 2：使用 gh CLI

```bash
# 如果已安装 gh CLI
cd /workspace/lx-music-mobile

# 登录
gh auth login

# 创建 release
gh release create v1.8.5 \
  --title "X Music v1.8.5 - 音效增强版" \
  --notes-file RELEASE_NOTES_v1.8.5.md \
  android/app/build/outputs/apk/release/*.apk
```

## 📋 Release Notes

```markdown
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
```

## ✅ 发布验证

发布成功后，访问：
https://github.com/lover520f/x-music/releases/tag/v1.8.5

确认：
- [ ] 所有 5 个 APK 文件都已上传
- [ ] Release notes 显示正常
- [ ] 文件大小正确

## 📊 APK 架构说明

| 架构 | 文件大小 | 适用设备 |
|------|---------|---------|
| arm64-v8a | 23MB | 绝大多数现代 Android 手机（推荐） |
| armeabi-v7a | 22MB | 老旧 32 位设备 |
| x86_64 | 23MB | 平板或模拟器 |
| x86 | 23MB | 旧款模拟器 |
| universal | 39MB | 通用版本（包含所有架构） |

---

**构建时间**: 2026-05-04
**版本号**: v1.8.5
**构建号**: 10804
