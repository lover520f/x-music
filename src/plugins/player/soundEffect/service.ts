import TrackPlayer from 'react-native-track-player'
import { initializeSoundEffect, releaseSoundEffect, updateNativeSoundEffectConfig, isSoundEffectSupported } from '@/utils/nativeModules/soundEffect'
import { soundEffectController, isSoundEffectSettingKey } from './controller'
import settingState from '@/store/setting/state'

let isInitialized = false
let isRegistered = false

// 初始化音效模块
const initSoundEffect = async() => {
  if (!isSoundEffectSupported || isInitialized) return
  
  try {
    // 获取当前 track 的 audio session id
    // 注意：react-native-track-player 不直接暴露 audio session id
    // 我们使用 AudioManager.AUDIO_SESSION_ID_GENERATE (0) 来让系统自动分配
    const result = await initializeSoundEffect(0)
    if (result) {
      isInitialized = true
      console.log('Sound effect initialized')
      
      // 应用当前音效设置
      const config = soundEffectController.buildCurrentConfig()
      await updateNativeSoundEffectConfig(config)
    }
  } catch (error) {
    console.error('Failed to initialize sound effect:', error)
  }
}

// 监听播放状态变化
const handlePlaybackState = async(info: any) => {
  if (!isSoundEffectSupported) return
  
  switch (info.state) {
    case 'playing':
      // 播放开始时确保音效已初始化
      if (!isInitialized) {
        await initSoundEffect()
      } else {
        // 重新应用当前配置
        const config = soundEffectController.buildCurrentConfig()
        await updateNativeSoundEffectConfig(config)
      }
      break
    case 'stopped':
      // 停止时释放音效资源
      if (isInitialized) {
        await releaseSoundEffect()
        isInitialized = false
      }
      break
  }
}

// 监听设置变化
export const handleSoundEffectConfigUpdate = async(keys: Array<keyof LX.AppSetting>) => {
  if (!isInitialized || !isSoundEffectSupported) return
  
  // 检查是否有音效相关的设置变化
  const hasSoundEffectKey = keys.some(key => isSoundEffectSettingKey(key))
  if (!hasSoundEffectKey) return
  
  try {
    const config = soundEffectController.buildCurrentConfig()
    await updateNativeSoundEffectConfig(config)
  } catch (error) {
    console.error('Failed to update sound effect config:', error)
  }
}

// 注册音效服务
export const registerSoundEffectService = () => {
  if (!isSoundEffectSupported || isRegistered) return
  
  isRegistered = true
  console.log('Registering sound effect service...')
  
  // 监听播放状态
  TrackPlayer.addEventListener('playback-state', handlePlaybackState)
  
  // 监听设置变化 - 将在外部调用 handleSoundEffectConfigUpdate
  // global.state_event.on('configUpdated', handleConfigUpdated)
  
  // 初始化音效模块
  void initSoundEffect()
}

// 注销音效服务
export const unregisterSoundEffectService = () => {
  if (!isRegistered) return
  
  isRegistered = false
  
  // 释放音效资源
  if (isInitialized) {
    void releaseSoundEffect()
    isInitialized = false
  }
  
  // 移除监听器
  // TrackPlayer 没有提供移除监听器的方法，所以需要小心使用
}
