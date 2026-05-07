import { memo, useMemo, useState } from 'react'
import { TouchableOpacity, View, ToastAndroid, StyleSheet } from 'react-native'

import Text from '@/components/common/Text'
import Slider from '@/components/common/Slider'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
// Removed createStyle and toast to avoid circular dependency
import { MoeKoeEQModule } from '@/utils/nativeModules/moekoeEQ'

// MoeKoe 31段频率
const MOEKOE_FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160,
  200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
  2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
] as const

const GAIN_MIN = -6
const GAIN_MAX = 6
const GAIN_STEP = 0.5

// 预设
const MOEKOE_PRESETS = [
  { id: 'flat', nameKey: 'moekoe_preset_flat', gains: Array(31).fill(0) },
  { id: 'rock', nameKey: 'moekoe_preset_rock', gains: [3, 3, 2, 2, 1, 0, -1, -1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, -1, -1, 0] },
  { id: 'classical', nameKey: 'moekoe_preset_classical', gains: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4] },
  { id: 'pop', nameKey: 'moekoe_preset_pop', gains: [-1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, -1, -1, -1] },
  { id: 'jazz', nameKey: 'moekoe_preset_jazz', gains: [2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0] },
  { id: 'bass', nameKey: 'moekoe_preset_bass', gains: [4, 4, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'treble', nameKey: 'moekoe_preset_treble', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4] },
  { id: 'vocal', nameKey: 'moekoe_preset_vocal', gains: [-2, -1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -2, -2, -2] },
  { id: 'fengxue', nameKey: 'moekoe_preset_fengxue', gains: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 1, 0, -1, 1, 0, 0, 1, -2, 0, -1, -1, 1, 2, 1] },
  { id: 'ultimate', nameKey: 'moekoe_preset_ultimate', gains: [2, 2, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2] },
  { id: 'harmankardon', nameKey: 'moekoe_preset_harmankardon', gains: [2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 0, 0, -1, -1, -1, 0, 0, 1, 1, 2, 2, 2, 3, 3, 2, 1, 1, 1, 1, 1, 1] },
  { id: 'harmanTarget', nameKey: 'moekoe_preset_harman_target', gains: [4, 4, 3, 3, 2, 2, 1, 1, 0, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 5] },
  { id: 'studioReference', nameKey: 'moekoe_preset_studio', gains: [2, 2, 1, 1, 0, 0, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0, 1, 2, 2, 2] },
  { id: 'vinylWarmth', nameKey: 'moekoe_preset_vinyl', gains: [3, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -2, -2, -3, -3, -4, -4] },
  { id: 'hiResDetail', nameKey: 'moekoe_preset_hires', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 3, 3, 3, 3] },
]

const formatGain = (gain: number) => `${gain > 0 ? '+' : ''}${Number.isInteger(gain) ? gain : gain.toFixed(1)}dB`
const formatFrequency = (freq: number) => freq >= 1000 ? `${freq / 1000}k` : `${freq}`

const PresetButton = memo(({
  presetId,
  isActive,
  onPress,
}: {
  presetId: string
  isActive: boolean
  onPress: () => void
}) => {
  const theme = useTheme()
  const t = useI18n()

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        ...styles.presetButton,
        backgroundColor: isActive ? theme['c-button-background-selected'] : theme['c-button-background'],
      }}
      onPress={onPress}>
      <Text size={12} color={isActive ? theme['c-button-font-selected'] : theme['c-button-font']}>
        {t(presetId)}
      </Text>
    </TouchableOpacity>
  )
})

const EqBandSlider = memo(({
  frequency,
  gain,
  onValueChange,
  onSlidingComplete,
}: {
  frequency: number
  gain: number
  onValueChange: (value: number) => void
  onSlidingComplete: (value: number) => void
}) => {
  const theme = useTheme()

  return (
    <View style={styles.eqBandItem}>
      <View style={styles.eqBandContent}>
        <Text size={11} style={styles.freqLabel}>{formatFrequency(frequency)}</Text>
        <View style={styles.sliderWrap}>
          <Slider
            minimumValue={GAIN_MIN}
            maximumValue={GAIN_MAX}
            step={GAIN_STEP}
            value={gain}
            onValueChange={onValueChange}
            onSlidingComplete={onSlidingComplete}
          />
        </View>
        <Text size={10} color={theme['c-font-label']} style={styles.gainValue}>{formatGain(gain)}</Text>
      </View>
    </View>
  )
})

export default memo(({
  enabled = true,
  onEnabledChange,
}: {
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
}) => {
  const t = useI18n()
  const theme = useTheme()
  const [gains, setGains] = useState<number[]>(Array(31).fill(0))
  const [activePreset, setActivePreset] = useState<string>('flat')

  const presetList = useMemo(() => MOEKOE_PRESETS.map(p => p.id), [])

  const handlePresetPress = async(presetId: string) => {
    const preset = MOEKOE_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    setGains([...preset.gains])
    setActivePreset(presetId)

    try {
      await MoeKoeEQModule.setGains(preset.gains, enabled)
    } catch (error) {
      console.error('Failed to apply preset:', error)
      ToastAndroid.show(t('moekoe_eq_apply_failed'), ToastAndroid.SHORT)
    }
  }

  const handleBandChange = async(frequency: number, index: number, value: number) => {
    const roundedValue = Math.round(value * 2) / 2
    const newGains = [...gains]
    newGains[index] = roundedValue
    setGains(newGains)
    setActivePreset('')

    try {
      await MoeKoeEQModule.setGains(newGains, enabled)
    } catch (error) {
      console.error('Failed to update gain:', error)
    }
  }

  const handleReset = async() => {
    setGains(Array(31).fill(0))
    setActivePreset('flat')

    try {
      await MoeKoeEQModule.setGains(Array(31).fill(0), enabled)
    } catch (error) {
      console.error('Failed to reset:', error)
    }
  }

  const handleToggleEnabled = async() => {
    const newEnabled = !enabled
    onEnabledChange?.(newEnabled)

    try {
      await MoeKoeEQModule.setEnabled(newEnabled)
    } catch (error) {
      console.error('Failed to toggle enabled:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('moekoe_eq_title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleEnabled}
            style={{ ...styles.toggleButton, backgroundColor: enabled ? theme['c-button-background-selected'] : theme['c-button-background'] }}>
            <Text size={12} color={enabled ? theme['c-button-font-selected'] : theme['c-button-font']}>
              {enabled ? t('moekoe_eq_enabled') : t('moekoe_eq_disabled')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleReset}
            style={{ ...styles.resetButton, backgroundColor: theme['c-button-background'] }}>
            <Text size={12} color={theme['c-button-font']}>{t('moekoe_eq_reset')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presetsContainer}>
        {presetList.map(presetId => (
          <PresetButton
            key={presetId}
            presetId={presetId}
            isActive={presetId === activePreset}
            onPress={() => { void handlePresetPress(presetId) }}
          />
        ))}
      </View>

      <View style={styles.eqGrid}>
        {MOEKOE_FREQUENCIES.map((freq, index) => (
          <EqBandSlider
            key={freq}
            frequency={freq}
            gain={gains[index]}
            onValueChange={value => { void handleBandChange(freq, index, value) }}
            onSlidingComplete={value => { void handleBandChange(freq, index, value) }}
          />
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  eqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  eqBandItem: {
    width: '33.33%',
    marginBottom: 8,
  },
  eqBandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  freqLabel: {
    width: 28,
    textAlign: 'center',
  },
  sliderWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  gainValue: {
    width: 32,
    textAlign: 'right',
  },
})
