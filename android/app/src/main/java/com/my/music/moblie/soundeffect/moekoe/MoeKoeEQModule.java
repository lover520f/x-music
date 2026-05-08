package com.my.music.moblie.soundeffect.moekoe;

import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class MoeKoeEQModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MoeKoeEQModule";
    private static final String MODULE_NAME = "MoeKoeEQ";
    
    public MoeKoeEQModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "MoeKoeEQModule initialized");
    }
    
    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    @ReactMethod
    public void setGains(ReadableArray gains, boolean enabled, Promise promise) {
        try {
            if (gains == null || gains.size() != 31) {
                promise.reject("INVALID", "Must have 31 elements");
                return;
            }
            Log.d(TAG, "Gains set: enabled=" + enabled);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error", e);
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void applyPreset(String name, Promise promise) {
        Log.d(TAG, "Preset: " + name);
        promise.resolve(true);
    }
    
    @ReactMethod
    public void setEnabled(boolean enabled, Promise promise) {
        Log.d(TAG, "Enabled: " + enabled);
        promise.resolve(true);
    }
}
