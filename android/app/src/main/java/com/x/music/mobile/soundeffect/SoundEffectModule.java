package com.x.music.mobile.soundeffect;

import android.media.audiofx.Equalizer;
import android.media.audiofx.BassBoost;
import android.media.audiofx.PresetReverb;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class SoundEffectModule extends ReactContextBaseJavaModule {
  private static final String TAG = "SoundEffect";
  
  private final ReactApplicationContext reactContext;
  
  private Equalizer equalizer;
  private BassBoost bassBoost;
  private PresetReverb reverb;

  public SoundEffectModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "SoundEffect";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("EQUALIZER_FREQ_COUNT", 5);
    constants.put("EQUALIZER_LEVEL_MIN", -1500);
    constants.put("EQUALIZER_LEVEL_MAX", 1500);
    return constants;
  }

  @ReactMethod
  public void initialize(int audioSessionId, Promise promise) {
    try {
      releaseEffects();
      
      int sessionId = audioSessionId > 0 ? audioSessionId : android.media.AudioManager.AUDIO_SESSION_ID_GENERATE;
      
      try {
        equalizer = new Equalizer(0, sessionId);
        if (equalizer != null) {
          short bands = equalizer.getNumberOfBands();
          Log.d(TAG, "Equalizer initialized with " + bands + " bands");
        }
      } catch (Exception e) {
        Log.w(TAG, "Equalizer not available", e);
      }
      
      try {
        bassBoost = new BassBoost(0, sessionId);
        if (bassBoost != null) {
          Log.d(TAG, "BassBoost initialized");
        }
      } catch (Exception e) {
        Log.w(TAG, "BassBoost not available", e);
      }
      
      try {
        reverb = new PresetReverb(0, sessionId);
        if (reverb != null) {
          Log.d(TAG, "Reverb initialized");
        }
      } catch (Exception e) {
        Log.w(TAG, "Reverb not available", e);
      }
      
      promise.resolve(true);
    } catch (Exception e) {
      Log.e(TAG, "Error initializing effects", e);
      promise.reject("INIT_ERROR", e.getMessage());
    }
  }

  @ReactMethod
  public void setEqualizerGains(double[] gains, Promise promise) {
    if (equalizer == null) {
      promise.resolve(false);
      return;
    }
    
    try {
      short bands = equalizer.getNumberOfBands();
      
      for (short i = 0; i < bands; i++) {
        int jsIndex = (int) ((float) i / bands * gains.length);
        if (jsIndex >= gains.length) jsIndex = gains.length - 1;
        
        short gain = (short) Math.round(gains[jsIndex] * 100);
        gain = (short) Math.max(equalizer.getBandLevelRange()[0], 
                               Math.min(equalizer.getBandLevelRange()[1], gain));
        
        equalizer.setBandLevel(i, gain);
      }
      
      promise.resolve(true);
    } catch (Exception e) {
      Log.e(TAG, "Error setting equalizer gains", e);
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void setVirtualizerEnabled(boolean enabled, Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void setVirtualizerStrength(int strength, Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void setReverbEnabled(boolean enabled, Promise promise) {
    if (reverb == null) {
      promise.resolve(false);
      return;
    }
    
    try {
      reverb.setEnabled(enabled);
      promise.resolve(true);
    } catch (Exception e) {
      Log.e(TAG, "Error setting reverb", e);
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void setReverbPreset(int preset, Promise promise) {
    if (reverb == null) {
      promise.resolve(false);
      return;
    }
    
    try {
      short shortPreset = (short) Math.max(0, Math.min(4, preset));
      reverb.setPreset(shortPreset);
      promise.resolve(true);
    } catch (Exception e) {
      Log.e(TAG, "Error setting reverb preset", e);
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void setLoudnessEnhancerEnabled(boolean enabled, Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void setLoudnessTargetGain(long gain, Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void setPlaybackRate(float rate, Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void release(Promise promise) {
    try {
      releaseEffects();
      promise.resolve(true);
    } catch (Exception e) {
      Log.e(TAG, "Error releasing effects", e);
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void isSupported(Promise promise) {
    promise.resolve(equalizer != null || bassBoost != null || reverb != null);
  }

  @ReactMethod
  public void getEqualizerInfo(Promise promise) {
    if (equalizer == null) {
      promise.resolve(null);
      return;
    }
    
    try {
      WritableMap info = Arguments.createMap();
      short bands = equalizer.getNumberOfBands();
      info.putInt("numberOfBands", bands);
      
      WritableMap bandLevels = Arguments.createMap();
      bandLevels.putInt("minLevel", equalizer.getBandLevelRange()[0]);
      bandLevels.putInt("maxLevel", equalizer.getBandLevelRange()[1]);
      info.putMap("bandLevelRange", bandLevels);
      
      WritableMap frequencies = Arguments.createMap();
      for (short i = 0; i < bands; i++) {
        frequencies.putInt("band" + i, equalizer.getCenterFreq(i));
      }
      info.putMap("centerFrequencies", frequencies);
      
      promise.resolve(info);
    } catch (Exception e) {
      Log.e(TAG, "Error getting equalizer info", e);
      promise.resolve(null);
    }
  }

  private void releaseEffects() {
    if (equalizer != null) {
      try {
        equalizer.release();
      } catch (Exception e) {
        Log.w(TAG, "Error releasing equalizer", e);
      }
      equalizer = null;
    }
    if (bassBoost != null) {
      try {
        bassBoost.release();
      } catch (Exception e) {
        Log.w(TAG, "Error releasing bassBoost", e);
      }
      bassBoost = null;
    }
    if (reverb != null) {
      try {
        reverb.release();
      } catch (Exception e) {
        Log.w(TAG, "Error releasing reverb", e);
      }
      reverb = null;
    }
  }

  @Override
  public void onCatalystInstanceDestroy() {
    releaseEffects();
  }
}
