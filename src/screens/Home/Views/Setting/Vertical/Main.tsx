import { memo, useCallback, useRef } from 'react'
import {FlatList, type FlatListProps, ScrollView, View} from 'react-native'

import Basic from '../settings/Basic'
import Player from '../settings/Player'
import LyricDesktop from '../settings/LyricDesktop'
import Search from '../settings/Search'
import List from '../settings/List'
import Sync from '../settings/Sync'
import Download from '../settings/Download'
import Backup from '../settings/Backup'
import Other from '../settings/Other'
import Version from '../settings/Version'
import About from '../settings/About'
import SoundEffect from '../settings/SoundEffect'
import { createStyle } from '@/utils/tools'
import { SETTING_SCREENS, type SettingScreenIds } from '../Main'

type FlatListType = FlatListProps<SettingScreenIds>

const styles = createStyle({
  content: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flex: 0,
  },
})

const ListItem = memo(
  ({ id }: { id: SettingScreenIds }) => {
    switch (id) {
      case 'player':
        return <Player />
      case 'lyric_desktop':
        return <LyricDesktop />
      case 'search':
        return <Search />
      case 'list':
        return <List />
      case 'download':
        return <Download />
      case 'sync':
        return <Sync />
      case 'backup':
        return <Backup />
      case 'other':
        return <Other />
      case 'version':
        return <Version />
      case 'about':
        return <About />
      case 'sound_effect':
        return <SoundEffect />
      case 'basic':
        return <Basic />
    }
  },
  () => true
)

export interface VerticalType {
  scrollToId: (id: SettingScreenIds) => void
}

const Main = () => {
  const scrollViewRef = useRef<ScrollView>(null)
  const itemRefs = useRef<Map<string, any>>(new Map())

  const scrollToId = useCallback((id: SettingScreenIds) => {
    const index = SETTING_SCREENS.indexOf(id)
    if (index >= 0 && scrollViewRef.current) {
      // 简单方案：直接滚动到底部附近（音效设置在底部）
      // TODO: 改进为精确定位到特定元素
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [])

  return (
    <ScrollView 
      ref={scrollViewRef}
      keyboardShouldPersistTaps={'always'} 
      contentContainerStyle={styles.content}
    >
      {SETTING_SCREENS.map(id => (
        <View 
          key={id} 
          ref={(ref) => {
            if (ref) itemRefs.current.set(id, ref)
            else itemRefs.current.delete(id)
          }}
        >
          <ListItem id={id} />
        </View>
      ))}
    </ScrollView>
  )
}

export default Main
