import { NativeModules } from 'react-native'

export interface MoeKoeEQModuleType {
  setGains(gains: number[], enabled: boolean): Promise<boolean>
  applyPreset(presetName: string): Promise<boolean>
  setEnabled(enabled: boolean): Promise<boolean>
}

const NativeMoeKoeEQ = NativeModules.MoeKoeEQ as MoeKoeEQModuleType | undefined

const noop = () => Promise.resolve(false)

export const MoeKoeEQModule: MoeKoeEQModuleType = NativeMoeKoeEQ ?? {
  setGains: noop,
  applyPreset: noop,
  setEnabled: noop,
}
