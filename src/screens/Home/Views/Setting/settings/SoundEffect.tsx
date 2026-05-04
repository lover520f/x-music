import { memo } from 'react'
import { View } from 'react-native'

import Section from '../components/Section'
import SoundEffectControl from '@/components/player/SoundEffectControl'
import { useI18n } from '@/lang'

export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_play_sound_effect')}>
      <View style={{ paddingTop: 10, paddingBottom: 10 }}>
        <SoundEffectControl showTip={true} layoutMode="stacked" />
      </View>
    </Section>
  )
})
