import {memo} from 'react'
import {View, StyleSheet} from 'react-native'
import MoeKoeEQScreen from './MoeKoeEQScreen'

type LayoutMode = 'split' | 'stacked'

interface SoundEffectControlProps {
  showTip?: boolean
  layoutMode?: LayoutMode
}

const SoundEffectControl = memo(({showTip, layoutMode}: SoundEffectControlProps) => {
  return (
    <View style={styles.container}>
      <MoeKoeEQScreen />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {flex: 1}
})

export default SoundEffectControl
