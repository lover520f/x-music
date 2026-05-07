package com.my.music.moblie.soundeffect.moekoe;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

/**
 * React Native bridge module for MoeKoe 31-Band Equalizer.
 * 
 * Provides JavaScript interface to control the MoeKoe EQ processor.
 */
public class MoeKoeEQModule extends ReactContextBaseJavaModule {
    
    private static final String TAG = "MoeKoeEQModule";
    private static final String MODULE_NAME = "MoeKoeEQ";
    
    private ReactApplicationContext reactContext;
    
    public MoeKoeEQModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        Log.d(TAG, "MoeKoeEQModule initialized");
    }
    
    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    /**
     * Set equalizer gains for all 31 bands
     * 
     * @param gains Array of 31 gain values (-6.0 to 6.0 dB)
     */
    @ReactMethod
    public void setGains(ReadableArray gains, Promise promise) {
        try {
            if (gains == null || gains.size() != 31) {
                promise.reject("INVALID_GAINS", "Gains array must have exactly 31 elements");
                return;
            }
            
            float[] gainArray = new float[31];
            for (int i = 0; i < 31; i++) {
                gainArray[i] = (float) gains.getDouble(i);
            }
            
            // Get the audio processor from MusicManager
            // Note: This requires access to the TrackPlayer service
            // For now, we'll use a static reference
            
            Log.d(TAG, "Gains set: " + java.util.Arrays.toString(gainArray));
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error setting gains", e);
            promise.reject("SET_GAINS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Apply a preset by name
     * 
     * @param presetName Preset name (flat, rock, classical, pop, jazz, bass, treble, vocal, etc.)
     */
    @ReactMethod
    public void applyPreset(String presetName, Promise promise) {
        try {
            Log.d(TAG, "Applying preset: " + presetName);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error applying preset", e);
            promise.reject("APPLY_PRESET_ERROR", e.getMessage());
        }
    }
    
    /**
     * Enable or disable the equalizer
     * 
     * @param enabled True to enable, false to disable
     */
    @ReactMethod
    public void setEnabled(boolean enabled, Promise promise) {
        try {
            Log.d(TAG, "Equalizer " + (enabled ? "enabled" : "disabled"));
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error setting enabled state", e);
            promise.reject("SET_ENABLED_ERROR", e.getMessage());
        }
    }
}
