export const pushSettingScreen = (id: string) => {
  global.lx.settingActiveId = id
  // 触发事件监听
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('setting-screen-change', { detail: id })
    window.dispatchEvent(event)
  }
}

