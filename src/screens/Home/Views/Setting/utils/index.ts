export const pushSettingScreen = (id: string) => {
  // 安全检查：确保 global.lx 已初始化
  if (!global.lx) {
    console.error('[Setting] global.lx is not initialized')
    return
  }
  
  // 设置全局 settingActiveId
  global.lx.settingActiveId = id
  
  // 触发 app_event 通知设置界面
  if (global.app_event && global.app_event.emit) {
    global.app_event.emit('setting-active-id-changed', { id })
  }
}

