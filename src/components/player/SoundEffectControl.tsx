import {memo} from 'react'
import {View, StyleSheet} from 'react-native'
import MoeKoeEQScreen from './MoeKoeEQScreen'

const SoundEffectControl = memo(() => {
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
