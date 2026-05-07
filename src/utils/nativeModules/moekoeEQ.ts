import { NativeModules } from 'react-native'

export interface MoeKoeEQModuleType {
  /**
   * Set equalizer gains for all 31 bands
   * @param gains Array of 31 gain values (-6.0 to 6.0 dB)
   * @param enabled Whether the equalizer is enabled
   */
  setGains(gains: number[], enabled: boolean): Promise<boolean>
  
  /**
   * Apply a preset by name
   * @param presetName Preset name (flat, rock, classical, pop, jazz, bass, treble, vocal, etc.)
   */
  applyPreset(presetName: string): Promise<boolean>
  
  /**
   * Enable or disable the equalizer
   * @param enabled True to enable, false to disable
   */
  setEnabled(enabled: boolean): Promise<boolean>
}

const NativeMoeKoeEQ = NativeModules.MoeKoeEQ as MoeKoeEQModuleType | undefined

const noop = () => Promise.resolve(false)

export const MoeKoeEQModule: MoeKoeEQModuleType = NativeMoeKoeEQ ?? {
  setGains: noop,
  applyPreset: noop,
  setEnabled: noop,
}
