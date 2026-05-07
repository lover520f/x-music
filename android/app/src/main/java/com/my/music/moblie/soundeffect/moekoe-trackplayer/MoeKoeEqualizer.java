package com.guichaguri.trackplayer.service.soundeffect.moekoe;

import android.util.Log;

import java.util.Arrays;

/**
 * MoeKoe 31-Band Parametric Equalizer for Android.
 * 
 * Frequency bands: 20Hz - 20kHz (ISO standard center frequencies)
 * Gain range: -6dB to +6dB
 * Q value range: 0.1 to 18.0 (default 1.4)
 * 
 * Based on MoeKoe-EQ-Plugin (https://github.com/RTuioi/MoeKoe-EQ-Plugin)
 */
public class MoeKoeEqualizer {
    private static final String TAG = "MoeKoeEQ";
    
    // 31 ISO standard center frequencies
    public static final float[] FREQUENCIES = {
        20, 25, 31.5f, 40, 50, 63, 80, 100, 125, 160,
        200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
        2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
    };
    
    public static final int NUM_BANDS = 31;
    public static final float GAIN_MIN = -6.0f;
    public static final float GAIN_MAX = 6.0f;
    public static final float GAIN_STEP = 0.5f;
    public static final float Q_VALUE_MIN = 0.1f;
    public static final float Q_VALUE_MAX = 18.0f;
    public static final float Q_VALUE_DEFAULT = 1.4f;
    
    // 31 peaking filters
    private final BiquadFilter[] filters;
    
    // Current settings
    private float[] gains;
    private float[] qValues;
    
    private double sampleRate;
    private boolean enabled;
    
    public MoeKoeEqualizer() {
        filters = new BiquadFilter[NUM_BANDS];
        gains = new float[NUM_BANDS];
        qValues = new float[NUM_BANDS];
        
        // Initialize with default values
        Arrays.fill(gains, 0.0f);
        Arrays.fill(qValues, Q_VALUE_DEFAULT);
        
        // Create filters
        for (int i = 0; i < NUM_BANDS; i++) {
            filters[i] = new BiquadFilter();
            filters[i].setType(BiquadFilter.Type.PEAKING);
            filters[i].setFrequency(FREQUENCIES[i]);
            filters[i].setQ(qValues[i]);
            filters[i].setGain(gains[i]);
        }
        
        this.sampleRate = 44100.0;
        this.enabled = false;
        
        Log.d(TAG, "MoeKoeEqualizer created with " + NUM_BANDS + " bands");
    }
    
    /**
     * Set the sample rate
     */
    public void setSampleRate(double sampleRate) {
        if (this.sampleRate != sampleRate) {
            this.sampleRate = sampleRate;
            for (int i = 0; i < NUM_BANDS; i++) {
                filters[i].setSampleRate(sampleRate);
            }
            Log.d(TAG, "Sample rate set to " + sampleRate);
        }
    }
    
    /**
     * Enable or disable the equalizer
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        if (!enabled) {
            reset();
        }
    }
    
    /**
     * Check if the equalizer is enabled
     */
    public boolean isEnabled() {
        return enabled;
    }
    
    /**
     * Set gain for a specific band
     */
    public void setBandGain(int bandIndex, float gainDb) {
        if (bandIndex < 0 || bandIndex >= NUM_BANDS) {
            Log.w(TAG, "Invalid band index: " + bandIndex);
            return;
        }
        gains[bandIndex] = Math.max(GAIN_MIN, Math.min(GAIN_MAX, gainDb));
        filters[bandIndex].setGain(gains[bandIndex]);
    }
    
    /**
     * Set Q value for a specific band
     */
    public void setBandQ(int bandIndex, float q) {
        if (bandIndex < 0 || bandIndex >= NUM_BANDS) {
            Log.w(TAG, "Invalid band index: " + bandIndex);
            return;
        }
        qValues[bandIndex] = Math.max(Q_VALUE_MIN, Math.min(Q_VALUE_MAX, q));
        filters[bandIndex].setQ(qValues[bandIndex]);
    }
    
    /**
     * Set all gains at once
     */
    public void setGains(float[] newGains) {
        if (newGains == null || newGains.length != NUM_BANDS) {
            Log.w(TAG, "Invalid gains array length: " + (newGains != null ? newGains.length : "null"));
            return;
        }
        System.arraycopy(newGains, 0, gains, 0, NUM_BANDS);
        for (int i = 0; i < NUM_BANDS; i++) {
            filters[i].setGain(gains[i]);
        }
    }
    
    /**
     * Set all Q values at once
     */
    public void setQValues(float[] newQValues) {
        if (newQValues == null || newQValues.length != NUM_BANDS) {
            Log.w(TAG, "Invalid qValues array length: " + (newQValues != null ? newQValues.length : "null"));
            return;
        }
        System.arraycopy(newQValues, 0, qValues, 0, NUM_BANDS);
        for (int i = 0; i < NUM_BANDS; i++) {
            filters[i].setQ(qValues[i]);
        }
    }
    
    /**
     * Get current gains
     */
    public float[] getGains() {
        return gains.clone();
    }
    
    /**
     * Get current Q values
     */
    public float[] getQValues() {
        return qValues.clone();
    }
    
    /**
     * Process a buffer of audio samples in-place
     * 
     * @param buffer Audio samples to process
     * @param offset Start offset in the buffer
     * @param length Number of samples to process
     */
    public void process(float[] buffer, int offset, int length) {
        if (!enabled || buffer == null || length <= 0) {
            return;
        }
        
        // Check if any band has non-zero gain
        boolean hasGain = false;
        for (int i = 0; i < NUM_BANDS; i++) {
            if (Math.abs(gains[i]) > 0.01f) {
                hasGain = true;
                break;
            }
        }
        
        if (!hasGain) {
            return;
        }
        
        // Apply each filter in series
        for (int i = 0; i < NUM_BANDS; i++) {
            filters[i].process(buffer, offset, length);
        }
    }
    
    /**
     * Process stereo audio samples in-place
     * 
     * @param buffer Interleaved stereo samples (L, R, L, R, ...)
     * @param length Total number of samples (must be even)
     */
    public void processStereo(float[] buffer, int length) {
        if (!enabled || buffer == null || length <= 0) {
            return;
        }
        
        // Check if any band has non-zero gain
        boolean hasGain = false;
        for (int i = 0; i < NUM_BANDS; i++) {
            if (Math.abs(gains[i]) > 0.01f) {
                hasGain = true;
                break;
            }
        }
        
        if (!hasGain) {
            return;
        }
        
        // Apply each filter to both channels
        for (int i = 0; i < NUM_BANDS; i++) {
            // Process left channel (even indices)
            for (int j = 0; j < length; j += 2) {
                buffer[j] = (float) filters[i].process(buffer[j]);
            }
            // Process right channel (odd indices)
            for (int j = 1; j < length; j += 2) {
                buffer[j] = (float) filters[i].process(buffer[j]);
            }
        }
    }
    
    /**
     * Reset filter states
     */
    public void reset() {
        for (int i = 0; i < NUM_BANDS; i++) {
            filters[i].reset();
        }
    }
    
    /**
     * Apply a preset
     */
    public void applyPreset(MoeKoePresets.Preset preset) {
        if (preset == null) {
            return;
        }
        setGains(preset.gains);
        Log.d(TAG, "Applied preset: " + preset.name);
    }
    
    /**
     * Check if the equalizer is active (has non-zero gains)
     */
    public boolean isActive() {
        for (float gain : gains) {
            if (Math.abs(gain) > 0.01f) {
                return true;
            }
        }
        return false;
    }
}
