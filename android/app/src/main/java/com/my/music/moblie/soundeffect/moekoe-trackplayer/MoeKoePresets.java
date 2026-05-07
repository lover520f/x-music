package com.guichaguri.trackplayer.service.soundeffect.moekoe;

/**
 * MoeKoe EQ Presets.
 * Based on MoeKoe-EQ-Plugin presets.
 */
public class MoeKoePresets {
    
    public static class Preset {
        public final String name;
        public final String nameCn;
        public final float[] gains;
        
        public Preset(String name, String nameCn, float[] gains) {
            this.name = name;
            this.nameCn = nameCn;
            this.gains = gains;
        }
    }
    
    /**
     * Get a preset by name
     */
    public static Preset getPreset(String name) {
        switch (name) {
            case "flat": return FLAT;
            case "rock": return ROCK;
            case "classical": return CLASSICAL;
            case "pop": return POP;
            case "jazz": return JAZZ;
            case "bass": return BASS_BOOST;
            case "treble": return TREBLE_BOOST;
            case "vocal": return VOCAL;
            case "fengxue": return FENGXUE;
            case "ultimate": return ULTIMATE;
            case "harmankardon": return HARMAN_KARDON;
            case "harmanTarget": return HARMAN_TARGET;
            case "studioReference": return STUDIO_REFERENCE;
            case "vinylWarmth": return VINYL_WARMTH;
            case "hiResDetail": return HI_RES_DETAIL;
            default: return FLAT;
        }
    }
    
    public static final Preset FLAT = new Preset("flat", "平坦", new float[]{
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    });
    
    public static final Preset ROCK = new Preset("rock", "摇滚", new float[]{
        3, 3, 2, 2, 1, 0, -1, -1, 0, 1,
        2, 3, 4, 4, 3, 2, 1, 0, 0, 1,
        2, 3, 4, 4, 3, 2, 1, 0, -1, -1, 0
    });
    
    public static final Preset CLASSICAL = new Preset("classical", "古典", new float[]{
        4, 3, 2, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4
    });
    
    public static final Preset POP = new Preset("pop", "流行", new float[]{
        -1, 0, 0, 1, 2, 3, 4, 4, 3, 2,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 2, 3, 3, 2, 1, 0, 0, -1, -1, -1
    });
    
    public static final Preset JAZZ = new Preset("jazz", "爵士", new float[]{
        2, 2, 1, 0, 0, 0, 0, 0, 0, 1,
        2, 3, 3, 2, 1, 0, 0, 0, 0, 0,
        0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0
    });
    
    public static final Preset BASS_BOOST = new Preset("bass", "低音增强", new float[]{
        4, 4, 3, 3, 2, 2, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    });
    
    public static final Preset TREBLE_BOOST = new Preset("treble", "高音增强", new float[]{
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4
    });
    
    public static final Preset VOCAL = new Preset("vocal", "人声", new float[]{
        -2, -1, 0, 0, 1, 2, 3, 4, 4, 3,
        2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, -1, -2, -2, -2
    });
    
    public static final Preset FENGXUE = new Preset("fengxue", "仿：风雪调音", new float[]{
        3, 3, 3, 3, 3, 3, 2, 2, 2, 2,
        1, 1, 1, 2, 2, 2, 2, 1, 0, -1,
        1, 0, 0, 1, -2, 0, -1, -1, 1, 2, 1
    });
    
    public static final Preset ULTIMATE = new Preset("ultimate", "极致听感", new float[]{
        2, 2, 2, 2, 3, 3, 3, 2, 2, 1,
        1, 1, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2
    });
    
    public static final Preset HARMAN_KARDON = new Preset("harmankardon", "醇美空间", new float[]{
        2, 2, 3, 3, 3, 3, 2, 2, 1, 1,
        0, 0, -1, -1, -1, 0, 0, 1, 1, 2,
        2, 2, 3, 3, 2, 1, 1, 1, 1, 1, 1
    });
    
    public static final Preset HARMAN_TARGET = new Preset("harmanTarget", "殿堂·哈基米曲线", new float[]{
        4, 4, 3, 3, 2, 2, 1, 1, 0, 0,
        -1, -1, -1, -1, -1, -1, -1, 0, 0, 0,
        0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 5
    });
    
    public static final Preset STUDIO_REFERENCE = new Preset("studioReference", "殿堂·母带处理", new float[]{
        2, 2, 1, 1, 0, 0, -1, -1, -1, 0,
        0, 0, 0, 0, 0, 0, 1, 1, 1, 2,
        2, 2, 1, 1, 0, 0, 0, 1, 2, 2, 2
    });
    
    public static final Preset VINYL_WARMTH = new Preset("vinylWarmth", "殿堂·黑胶温暖", new float[]{
        3, 3, 3, 2, 2, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, -1, -2, -2, -3, -3, -4, -4
    });
    
    public static final Preset HI_RES_DETAIL = new Preset("hiResDetail", "殿堂·Hi-Res解析", new float[]{
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 1, 1, 2,
        2, 2, 2, 3, 3, 2, 2, 3, 3, 3, 3
    });
}
