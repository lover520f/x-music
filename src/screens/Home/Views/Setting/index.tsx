import { useHorizontalMode } from '@/utils/hooks'
import Vertical from './Vertical'
import Horizontal from './Horizontal'
import { useBackHandler } from '@/utils/hooks/useBackHandler'
import { useCallback, useEffect, useRef } from 'react'
import commonState from '@/store/common/state'
import { setNavActiveId } from '@/core/common'
import { type MainType } from './Main'

export type { SettingScreenIds } from './Main'

export default () => {
  const isHorizontalMode = useHorizontalMode()
  const mainRef = useRef<MainType>(null)

  // 监听音效按钮点击事件
  useEffect(() => {
    const handleOpenSoundEffect = () => {
      if (mainRef.current && commonState.navActiveId === 'nav_setting') {
        mainRef.current.setActiveId('sound_effect')
      }
    }

    global.app_event.on('open-setting-sound-effect', handleOpenSoundEffect)
    return () => {
      global.app_event.off('open-setting-sound-effect', handleOpenSoundEffect)
    }
  }, [])

  useBackHandler(
    useCallback(() => {
      if (
        commonState.componentIds.length == 1 &&
        commonState.navActiveId == 'nav_setting'
      ) {
        setNavActiveId(commonState.lastNavActiveId)
        return true
      }
      return false
    }, [])
  )

  return isHorizontalMode ? <Horizontal mainRef={mainRef} /> : <Vertical />
}
