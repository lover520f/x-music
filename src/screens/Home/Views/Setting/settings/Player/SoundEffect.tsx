import { memo } from 'react'
import { View } from 'react-native'

import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import CheckBoxItem from '../../components/CheckBoxItem'

export interface SoundEffectProps {}

const SoundEffect = memo(() => {
  const t = useI18n()
  const soundEffectEnabled = useSettingValue('player.soundEffect.enable')

  const setSoundEffectEnabled = (enabled: boolean) => {
    updateSetting({ 'player.soundEffect.enable': enabled })
  }

  return (
    <View style={styles.content}>
      <CheckBoxItem
        check={soundEffectEnabled}
        label={t('setting_play_sound_effect')}
        onChange={setSoundEffectEnabled}
      />
    </View>
  )
})

export default SoundEffect

const styles = createStyle({
  content: {
    marginTop: 5,
  },
})
