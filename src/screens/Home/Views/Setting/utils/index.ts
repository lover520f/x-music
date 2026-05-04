export const pushSettingScreen = (id: string) => {
  // 设置全局 settingActiveId
  global.lx.settingActiveId = id
  
  // 触发设置界面内部的事件（如果存在）
  if (typeof window !== 'undefined') {
    // 使用 CustomEvent 通知设置界面
    const event = new CustomEvent('setting-active-id-change', { 
      detail: id,
      bubbles: true,
      cancelable: true,
    })
    window.dispatchEvent(event)
  }
  
  // 同时触发 app_event（用于其他可能的监听器）
  if (global.app_event && global.app_event.emit) {
    global.app_event.emit('setting-active-id-changed', { id })
  }
}

