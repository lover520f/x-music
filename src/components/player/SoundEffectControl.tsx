import { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import MoeKoeEQScreen from './MoeKoeEQScreen'

type LayoutMode = 'split' | 'stacked'

interface Props {
  showTip?: boolean
  layoutMode?: LayoutMode
}

const SoundEffectControl = memo(({ showTip = false, layoutMode = 'split' }: Props) => {
  return (
    <View style={styles.container}>
      <MoeKoeEQScreen />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
})

export default SoundEffectControl
