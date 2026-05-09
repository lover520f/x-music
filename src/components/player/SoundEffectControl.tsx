import { memo, useRef, useState } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import MoeKoeEQScreen from './MoeKoeEQScreen'

type LayoutMode = 'split' | 'stacked'

interface Props {
  showTip?: boolean
  layoutMode?: LayoutMode
}

const SoundEffectControl = memo(({ showTip = false, layoutMode = 'split' }: Props) => {
  const t = useI18n()
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <MoeKoeEQScreen />
    </View>
  )
})

const styles = createStyle({
  container: {
    paddingTop: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    flex: 1,
  },
})

export default SoundEffectControl
