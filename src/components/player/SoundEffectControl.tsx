import {memo} from 'react'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {useI18n} from '@/lang'
import {useTheme} from '@/store/theme/hook'
import {useDispatch} from 'react-redux'
import MoeKoeEQScreen from './MoeKoeEQScreen'

const SoundEffectControl = memo(() => {
  const t = useI18n()
  const theme = useTheme()

  return (
    <View style={[styles.container, {backgroundColor: theme['c-content']}]}>
      <MoeKoeEQScreen />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default SoundEffectControl
