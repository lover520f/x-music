import React, {memo, useState, useCallback} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native'
import Slider from '@react-native-community/slider'
import {useI18n} from '@/lang'
import {useTheme} from '@/store/theme/hook'
import {MoeKoeEQModule} from '@/utils/nativeModules/moekoeEQ'

const FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160,
  200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
  2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
]

const PRESETS = [
  {id: 'flat', name: 'moekoe_preset_flat', gains: Array(31).fill(0)},
  {id: 'rock', name: 'moekoe_preset_rock', gains: [3,3,2,2,1,0,-1,-1,0,1,2,3,4,4,3,2,1,0,0,1,2,3,4,4,3,2,1,0,-1,-1,0]},
  {id: 'classical', name: 'moekoe_preset_classical', gains: [4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,4,4]},
  {id: 'pop', name: 'moekoe_preset_pop', gains: [-1,0,0,1,2,3,4,4,3,2,1,0,0,0,0,0,0,0,0,0,1,2,3,3,2,1,0,0,-1,-1,-1]},
  {id: 'jazz', name: 'moekoe_preset_jazz', gains: [2,2,1,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0]},
  {id: 'bass', name: 'moekoe_preset_bass', gains: [4,4,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
  {id: 'treble', name: 'moekoe_preset_treble', gains: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,4,4,4]},
  {id: 'vocal', name: 'moekoe_preset_vocal', gains: [-2,-1,0,0,1,2,3,4,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-2,-2,-2]},
  {id: 'fengxue', name: 'moekoe_preset_fengxue', gains: [3,3,3,3,3,3,2,2,2,2,1,1,1,2,2,2,2,1,0,-1,1,0,0,1,-2,0,-1,-1,1,2,1]},
  {id: 'ultimate', name: 'moekoe_preset_ultimate', gains: [2,2,2,2,3,3,3,2,2,1,1,1,0,0,0,0,0,0,0,-1,-1,0,0,1,1,1,1,2,2,2,2]},
  {id: 'harmankardon', name: 'moekoe_preset_harmankardon', gains: [2,2,3,3,3,3,2,2,1,1,0,0,-1,-1,-1,0,0,1,1,2,2,2,3,3,2,1,1,1,1,1,1]},
  {id: 'harmanTarget', name: 'moekoe_preset_harman_target', gains: [4,4,3,3,2,2,1,1,0,0,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,1,1,2,2,3,4,4,5,5]},
  {id: 'studio', name: 'moekoe_preset_studio', gains: [2,2,1,1,0,0,-1,-1,-1,0,0,0,0,0,0,0,1,1,1,2,2,2,1,1,0,0,0,1,2,2,2]},
  {id: 'vinyl', name: 'moekoe_preset_vinyl', gains: [3,3,3,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-2,-2,-3,-3,-4,-4]},
  {id: 'hires', name: 'moekoe_preset_hires', gains: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,2,3,3,2,2,3,3,3,3]},
]

const formatFreq = (f: number) => f >= 1000 ? `${(f/1000).toFixed(1)}k` : `${f}`
const formatGain = (g: number) => `${g >= 0 ? '+' : ''}${g.toFixed(1)}dB`

const MoeKoeEQScreen = memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const [gains, setGains] = useState<number[]>(Array(31).fill(0))
  const [activePreset, setActivePreset] = useState<string>('flat')
  const [enabled, setEnabled] = useState(true)

  const applyPreset = useCallback(async (presetId: string) => {
    try {
      const preset = PRESETS.find(p => p.id === presetId)
      if (!preset) return
      
      setGains([...preset.gains])
      setActivePreset(presetId)
      
      const result = await MoeKoeEQModule.setGains(preset.gains, enabled)
      console.log('Preset applied:', presetId, result)
    } catch (err) {
      console.error('Apply preset error:', err)
      ToastAndroid.showWithGravity(
        t('moekoe_eq_apply_failed') || 'Apply failed',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      )
    }
  }, [enabled, t])

  const changeGain = useCallback(async (index: number, value: number) => {
    try {
      const rounded = Math.round(value * 2) / 2
      const newGains = [...gains]
      newGains[index] = rounded
      setGains(newGains)
      setActivePreset('')
      
      await MoeKoeEQModule.setGains(newGains, enabled)
    } catch (err) {
      console.error('Change gain error:', err)
    }
  }, [gains, enabled])

  const reset = useCallback(async () => {
    try {
      setGains(Array(31).fill(0))
      setActivePreset('flat')
      await MoeKoeEQModule.setGains(Array(31).fill(0), enabled)
    } catch (err) {
      console.error('Reset error:', err)
    }
  }, [enabled])

  const toggleEnabled = useCallback(async () => {
    try {
      const newEnabled = !enabled
      setEnabled(newEnabled)
      await MoeKoeEQModule.setEnabled(newEnabled)
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }, [enabled])

  return (
    <View style={[styles.container, {backgroundColor: theme['c-content']}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme['c-font']}]}>
          {t('moekoe_eq_title') || '31-Band Equalizer'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: enabled ? theme['c-button-background-selected'] : theme['c-button-background']}]}
            onPress={toggleEnabled}
          >
            <Text style={{color: enabled ? theme['c-button-font-selected'] : theme['c-button-font'], fontSize: 12}}>
              {enabled ? t('moekoe_eq_enabled') : t('moekoe_eq_disabled')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: theme['c-button-background']}]}
            onPress={reset}
          >
            <Text style={{color: theme['c-button-font'], fontSize: 12}}>
              {t('moekoe_eq_reset') || 'Reset'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Presets */}
      <View style={styles.presetsContainer}>
        {PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetBtn,
              {backgroundColor: activePreset === preset.id ? theme['c-button-background-selected'] : theme['c-button-background']}
            ]}
            onPress={() => applyPreset(preset.id)}
          >
            <Text 
              numberOfLines={1}
              style={{
                fontSize: 11,
                color: activePreset === preset.id ? theme['c-button-font-selected'] : theme['c-button-font']
              }}
            >
              {t(preset.name)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* EQ Bands */}
      <View style={styles.eqGrid}>
        {FREQUENCIES.map((freq, index) => (
          <View key={freq} style={styles.bandContainer}>
            <Text style={[styles.freqLabel, {color: theme['c-font-label']}]}>
              {formatFreq(freq)}
            </Text>
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={-6}
                maximumValue={6}
                step={0.5}
                value={gains[index]}
                onValueChange={(value) => changeGain(index, value)}
                minimumTrackTintColor={theme['c-primary']}
                maximumTrackTintColor={theme['c-primary-alpha-500']}
                thumbTintColor={theme['c-primary']}
              />
            </View>
            <Text style={[styles.gainLabel, {color: theme['c-font-label']}]}>
              {formatGain(gains[index])}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 15,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  eqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  bandContainer: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  slider: {
    height: 40,
    width: '100%',
  },
  freqLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  gainLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    minWidth: 40,
  },
})

export default MoeKoeEQScreen
