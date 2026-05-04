export const pushSettingScreen = (id: string) => {
  // 安全检查：确保 global.lx 已初始化
  if (!global.lx) {
    console.error('[Setting] global.lx is not initialized')
    return
  }
  
  // 设置全局 settingActiveId（用于 Horizontal 模式）
  global.lx.settingActiveId = id
  
  // 触发事件通知设置页面（Horizontal 模式使用）
  if (global.app_event && global.app_event.emit) {
    global.app_event.emit('open-setting-sound-effect')
  }
}

