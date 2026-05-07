package com.guichaguri.trackplayer.service.soundeffect.moekoe;

import android.util.Log;

import androidx.media3.common.util.UnstableApi;
import androidx.media3.common.audio.AudioProcessor;

import com.guichaguri.trackplayer.service.Utils;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.ShortBuffer;
import java.util.ArrayList;
import java.util.List;

/**
 * ExoPlayer AudioProcessor adapter for MoeKoe 31-Band Equalizer.
 * 
 * Converts PCM 16-bit audio from ExoPlayer to float samples, processes them
 * through the MoeKoe 31-band parametric EQ, and converts back to PCM 16-bit.
 * 
 * Based on MoeKoe-EQ-Plugin (https://github.com/RTuioi/MoeKoe-EQ-Plugin)
 */
@UnstableApi
public class MoeKoeAudioProcessor implements AudioProcessor {

    private static final String TAG = "MoeKoeAudioProc";

    private int sampleRate;
    private int channelCount;
    private boolean isConfigured;
    private boolean inputEnded;

    private final MoeKoeEqualizer equalizer;

    // Accumulation buffer for output data
    private final List<ByteBuffer> pendingOutput = new ArrayList<>();

    public MoeKoeAudioProcessor() {
        this.equalizer = new MoeKoeEqualizer();
        this.sampleRate = 0;
        this.channelCount = 0;
        this.isConfigured = false;
        this.inputEnded = false;
        
        Log.d(TAG, "MoeKoeAudioProcessor created");
    }

    /**
     * Get the underlying equalizer instance for configuration
     */
    public MoeKoeEqualizer getEqualizer() {
        return equalizer;
    }

    /**
     * Set equalizer gains
     */
    public void setGains(float[] gains) {
        if (equalizer != null) {
            equalizer.setGains(gains);
        }
    }

    /**
     * Set equalizer Q values
     */
    public void setQValues(float[] qValues) {
        if (equalizer != null) {
            equalizer.setQValues(qValues);
        }
    }

    /**
     * Enable or disable the equalizer
     */
    public void setEnabled(boolean enabled) {
        if (equalizer != null) {
            equalizer.setEnabled(enabled);
        }
    }

    /**
     * Apply a preset
     */
    public void applyPreset(String presetName) {
        if (equalizer != null) {
            MoeKoePresets.Preset preset = MoeKoePresets.getPreset(presetName);
            equalizer.applyPreset(preset);
        }
    }

    @Override
    public AudioProcessor.AudioFormat configure(AudioProcessor.AudioFormat inputFormat)
            throws AudioProcessor.UnhandledAudioFormatException {
        // Only support PCM 16-bit
        if (inputFormat.encoding != android.media.AudioFormat.ENCODING_PCM_16BIT) {
            throw new AudioProcessor.UnhandledAudioFormatException(inputFormat);
        }

        this.sampleRate = inputFormat.sampleRate;
        this.channelCount = inputFormat.channelCount;
        this.isConfigured = true;

        // Configure equalizer with sample rate
        if (equalizer != null) {
            equalizer.setSampleRate(inputFormat.sampleRate);
        }

        Log.d(TAG, "Configured: sampleRate=" + sampleRate + ", channels=" + channelCount);

        // Return the same format (we output PCM 16-bit)
        return inputFormat;
    }

    @Override
    public void queueInput(ByteBuffer inputBuffer) {
        int position = inputBuffer.position();
        int limit = inputBuffer.limit();
        int byteCount = limit - position;

        if (byteCount == 0) {
            return;
        }

        // Advance the input buffer position so ExoPlayer knows we consumed it
        inputBuffer.position(limit);

        // If equalizer is not active, pass through without processing
        if (equalizer == null || !equalizer.isEnabled() || !equalizer.isActive()) {
            ByteBuffer passThrough = inputBuffer.duplicate();
            passThrough.position(position);
            passThrough.limit(limit);
            pendingOutput.add(passThrough.slice());
            return;
        }

        // Convert PCM 16-bit to float samples
        int sampleCount = byteCount / 2; // 16-bit = 2 bytes per sample
        float[] floatSamples = new float[sampleCount];

        ByteBuffer byteBuf = inputBuffer.duplicate().order(ByteOrder.LITTLE_ENDIAN);
        byteBuf.position(position);
        ShortBuffer shortBuffer = byteBuf.asShortBuffer();

        for (int i = 0; i < sampleCount; i++) {
            floatSamples[i] = shortBuffer.get() / 32768.0f;
        }

        // Process through MoeKoe equalizer
        if (channelCount == 2) {
            // Stereo processing
            equalizer.processStereo(floatSamples, sampleCount);
        } else {
            // Mono processing
            equalizer.process(floatSamples, 0, sampleCount);
        }

        // Convert float back to PCM 16-bit
        ByteBuffer outputBuf = ByteBuffer.allocateDirect(floatSamples.length * 2).order(ByteOrder.LITTLE_ENDIAN);
        for (float sample : floatSamples) {
            // Clip to [-1, 1] range and convert to 16-bit
            short value = (short) (Math.max(-1.0f, Math.min(1.0f, sample)) * 32767.0f);
            outputBuf.putShort(value);
        }
        outputBuf.flip();
        pendingOutput.add(outputBuf);
    }

    @Override
    public void queueEndOfStream() {
        inputEnded = true;
    }

    @Override
    public ByteBuffer getOutput() {
        if (pendingOutput.isEmpty()) {
            return EMPTY_BUFFER;
        }

        // Calculate total size needed
        int totalSize = 0;
        for (ByteBuffer buf : pendingOutput) {
            totalSize += buf.remaining();
        }

        // Concatenate all pending buffers
        ByteBuffer combined = ByteBuffer.allocateDirect(totalSize).order(ByteOrder.LITTLE_ENDIAN);
        for (ByteBuffer buf : pendingOutput) {
            combined.put(buf);
        }
        combined.flip();

        pendingOutput.clear();
        return combined;
    }

    @Override
    public boolean isEnded() {
        return inputEnded && pendingOutput.isEmpty();
    }

    @Override
    public void flush() {
        pendingOutput.clear();
        inputEnded = false;
        if (equalizer != null) {
            equalizer.reset();
        }
    }

    @Override
    public void reset() {
        flush();
        isConfigured = false;
    }

    @Override
    public boolean isActive() {
        return equalizer != null && equalizer.isEnabled() && equalizer.isActive();
    }
}
