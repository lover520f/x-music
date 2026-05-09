import React from 'react'
import {View, Text, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native'
import Slider from '@react-native-community/slider'
import {useI18n} from '@/lang'
import {useTheme} from '@/store/theme/hook'
import {MoeKoeEQModule} from '@/utils/nativeModules/moekoeEQ'

const FREQUENCIES = [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000]

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

function MoeKoeEQScreen() {
  const t = useI18n()
  const theme = useTheme()
  const [gains, setGains] = React.useState(Array(31).fill(0))
  const [activePreset, setActivePreset] = React.useState('flat')
  const [enabled, setEnabled] = React.useState(true)

  const applyGains = React.useCallback(async (newGains, presetId) => {
    try {
      setGains([...newGains])
      if (presetId) setActivePreset(presetId)
      await MoeKoeEQModule.setGains(newGains, enabled)
    } catch (e) {
      console.log('EQ error:', e.message)
      ToastAndroid.show(t('moekoe_eq_apply_failed') || 'Error', ToastAndroid.SHORT)
    }
  }, [enabled, t])

  const applyPreset = React.useCallback(async (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (preset) applyGains(preset.gains, presetId)
  }, [applyGains])

  const reset = React.useCallback(() => {
    applyGains(Array(31).fill(0), 'flat')
  }, [applyGains])

  const toggleEnabled = React.useCallback(async () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    try {
      await MoeKoeEQModule.setEnabled(newEnabled)
    } catch (e) {
      console.log('Toggle error:', e)
    }
  }, [enabled])

  const formatFreq = React.useCallback((f) => f >= 1000 ? (f/1000).toFixed(1) + 'k' : String(f), [])
  const formatGain = React.useCallback((g) => (g >= 0 ? '+' : '') + g.toFixed(1) + 'dB', [])

  return (
    <View style={[styles.container, {backgroundColor: theme['c-content']}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme['c-font']}]}>{t('moekoe_eq_title') || '31-Band EQ'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.btn, {backgroundColor: enabled ? theme['c-button-background-selected'] : theme['c-button-background']}]} onPress={toggleEnabled}>
            <Text style={{fontSize: 12, color: enabled ? theme['c-button-font-selected'] : theme['c-button-font']}}>
              {enabled ? t('moekoe_eq_enabled') : t('moekoe_eq_disabled')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, {backgroundColor: theme['c-button-background']}]} onPress={reset}>
            <Text style={{fontSize: 12, color: theme['c-button-font']}}>{t('moekoe_eq_reset') || 'Reset'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presetsContainer}>
        {PRESETS.map(p => (
          <TouchableOpacity key={p.id} style={[styles.presetBtn, {backgroundColor: activePreset === p.id ? theme['c-button-background-selected'] : theme['c-button-background']}]} onPress={() => applyPreset(p.id)}>
            <Text numberOfLines={1} style={{fontSize: 11, color: activePreset === p.id ? theme['c-button-font-selected'] : theme['c-button-font']}}>{t(p.name)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.eqGrid}>
        {FREQUENCIES.map((freq, index) => (
          <View key={freq} style={styles.bandContainer}>
            <Text style={[styles.freqLabel, {color: theme['c-font-label']}]}>{formatFreq(freq)}</Text>
            <View style={styles.sliderWrapper}>
              <Slider style={styles.slider} minimumValue={-6} maximumValue={6} step={0.5} value={gains[index]} onValueChange={(v) => {
                const newGains = [...gains]
                newGains[index] = Math.round(v * 2) / 2
                applyGains(newGains, undefined)
              }} minimumTrackTintColor={theme['c-primary']} maximumTrackTintColor="rgba(128,128,128,0.5)" thumbTintColor={theme['c-primary']} />
            </View>
            <Text style={[styles.gainLabel, {color: theme['c-font-label']}]}>{formatGain(gains[index])}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 15, paddingHorizontal: 15},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15},
  title: {fontSize: 18, fontWeight: 'bold'},
  headerActions: {flexDirection: 'row', gap: 8},
  btn: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4},
  presetsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15},
  presetBtn: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, minWidth: 60, alignItems: 'center'},
  eqGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 4},
  bandContainer: {width: '33.33%', alignItems: 'center', marginBottom: 8},
  sliderWrapper: {flex: 1, width: '100%', justifyContent: 'center'},
  slider: {height: 40, width: '100%'},
  freqLabel: {fontSize: 11, textAlign: 'center', marginBottom: 4},
  gainLabel: {fontSize: 10, textAlign: 'center', marginTop: 4, minWidth: 40},
})

export default MoeKoeEQScreen
