import { NativeModules, Platform } from 'react-native'
import type { SoundEffectConfig } from '@/plugins/player/soundEffect/types'

export interface NativeEqualizerConfig {
  enabled: boolean
  gains: number[]
}

interface NativeSoundEffectModule {
  initialize: (audioSessionId: number) => Promise<boolean>
  setEqualizerGains: (gains: number[]) => Promise<boolean>
  setVirtualizerEnabled: (enabled: boolean) => Promise<boolean>
  setVirtualizerStrength: (strength: number) => Promise<boolean>
  setReverbEnabled: (enabled: boolean) => Promise<boolean>
  setReverbPreset: (preset: number) => Promise<boolean>
  setLoudnessEnhancerEnabled: (enabled: boolean) => Promise<boolean>
  setLoudnessTargetGain: (gain: number) => Promise<boolean>
  setPlaybackRate: (rate: number) => Promise<boolean>
  release: () => Promise<boolean>
  isSupported: () => Promise<boolean>
  getEqualizerInfo: () => Promise<{
    numberOfBands: number
    bandLevelRange: { minLevel: number; maxLevel: number }
    centerFrequencies: Record<string, number>
  }>
}

const { SoundEffect } = NativeModules as { SoundEffect?: NativeSoundEffectModule }

const isAndroid = Platform.OS === 'android'
const hasNativeModule = typeof SoundEffect !== 'undefined'

export const isSoundEffectSupported = isAndroid && hasNativeModule

let isInitialized = false
let audioSessionId = 0

export const initializeSoundEffect = async(sessionId: number) => {
  if (!isSoundEffectSupported || !sessionId) return false
  
  try {
    audioSessionId = sessionId
    const result = await SoundEffect!.initialize(sessionId)
    isInitialized = result
    return result
  } catch (error) {
    console.error('Failed to initialize sound effect:', error)
    return false
  }
}

export const updateNativeSoundEffectConfig = async(config: SoundEffectConfig) => {
  if (!isSoundEffectSupported || !isInitialized) return
  
  try {
    // Update equalizer
    if (config.equalizer.enabled) {
      await SoundEffect!.setEqualizerGains(config.equalizer.gains)
    }
    
    // Update virtualizer (surround sound)
    await SoundEffect!.setVirtualizerEnabled(config.panner.enabled)
    if (config.panner.enabled) {
      // Map speed to strength (1-50 -> 0-100)
      const strength = Math.round((config.panner.speed / 50) * 100)
      await SoundEffect!.setVirtualizerStrength(strength)
    }
    
    // Update reverb (convolution simulation)
    const hasConvolution = !!config.convolution.fileName && config.convolution.enabled
    await SoundEffect!.setReverbEnabled(hasConvolution)
    if (hasConvolution) {
      // Map convolution preset to reverb preset
      // This is a simplified mapping - real implementation would use actual convolution
      const preset = config.convolution.mainGain > 10 ? 4 : 2 // LARGEHALL or LARGEROOM
      await SoundEffect!.setReverbPreset(preset)
    }
    
    // Update loudness enhancer
    const hasLoudness = config.convolution.mainGain > 0
    await SoundEffect!.setLoudnessEnhancerEnabled(hasLoudness)
    if (hasLoudness) {
      // Convert gain from 0-50 to millibels
      const gainMb = Math.round((config.convolution.mainGain / 50) * 1500)
      await SoundEffect!.setLoudnessTargetGain(gainMb)
    }
    
    // Update playback rate
    if (config.pitchShifter.playbackRate !== 1.0) {
      await SoundEffect!.setPlaybackRate(config.pitchShifter.playbackRate)
    }
  } catch (error) {
    console.error('Failed to update sound effect config:', error)
  }
}

export const updateNativeEqualizerConfig = async(config: NativeEqualizerConfig) => {
  if (!isSoundEffectSupported || !isInitialized) return
  
  try {
    await SoundEffect!.setEqualizerGains(config.gains)
  } catch (error) {
    console.error('Failed to update equalizer config:', error)
  }
}

export const releaseSoundEffect = async() => {
  if (!isSoundEffectSupported || !isInitialized) return
  
  try {
    await SoundEffect!.release()
    isInitialized = false
    audioSessionId = 0
  } catch (error) {
    console.error('Failed to release sound effect:', error)
  }
}
