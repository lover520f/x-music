package com.guichaguri.trackplayer.service.soundeffect.moekoe;

/**
 * Biquad Filter implementation for Android.
 * Based on Web Audio API BiquadFilterNode algorithm.
 * 
 * Supports: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
 */
public class BiquadFilter {
    
    public enum Type {
        LOWPASS, HIGHPASS, BANDPASS, LOWSHELF, HIGHSHELF, PEAKING, NOTCH, ALLPASS
    }
    
    // Filter coefficients
    private double b0, b1, b2, a1, a2;
    
    // Delay line (state variables)
    private double x1, x2, y1, y2;
    
    private Type type;
    private double frequency;
    private double q;
    private double gain;
    private double sampleRate;
    
    public BiquadFilter() {
        this.sampleRate = 44100.0;
        this.type = Type.PEAKING;
        this.frequency = 1000.0;
        this.q = 1.0;
        this.gain = 0.0;
        reset();
    }
    
    public void reset() {
        x1 = x2 = y1 = y2 = 0.0;
    }
    
    public void setSampleRate(double sampleRate) {
        if (this.sampleRate != sampleRate) {
            this.sampleRate = sampleRate;
            recalculateCoefficients();
        }
    }
    
    public void setType(Type type) {
        if (this.type != type) {
            this.type = type;
            recalculateCoefficients();
        }
    }
    
    public void setFrequency(double frequency) {
        if (this.frequency != frequency) {
            this.frequency = frequency;
            recalculateCoefficients();
        }
    }
    
    public void setQ(double q) {
        if (this.q != q) {
            this.q = q;
            recalculateCoefficients();
        }
    }
    
    public void setGain(double gainDb) {
        if (this.gain != gainDb) {
            this.gain = gainDb;
            recalculateCoefficients();
        }
    }
    
    /**
     * Process a single sample
     */
    public double process(double input) {
        double output = b0 * input + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        
        // Shift delay line
        x2 = x1;
        x1 = input;
        y2 = y1;
        y1 = output;
        
        return output;
    }
    
    /**
     * Process a buffer of samples in-place
     */
    public void process(float[] buffer, int offset, int length) {
        for (int i = offset; i < offset + length; i++) {
            buffer[i] = (float) process(buffer[i]);
        }
    }
    
    /**
     * Recalculate filter coefficients based on current parameters
     */
    private void recalculateCoefficients() {
        double omega = 2.0 * Math.PI * frequency / sampleRate;
        double sinOmega = Math.sin(omega);
        double cosOmega = Math.cos(omega);
        double alpha;
        
        double a0_, b0_, b1_, b2_, a1_, a2_;
        
        switch (type) {
            case LOWPASS:
                alpha = sinOmega / (2.0 * q);
                b0_ = (1.0 - cosOmega) / 2.0;
                b1_ = 1.0 - cosOmega;
                b2_ = (1.0 - cosOmega) / 2.0;
                a0_ = 1.0 + alpha;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha;
                break;
                
            case HIGHPASS:
                alpha = sinOmega / (2.0 * q);
                b0_ = (1.0 + cosOmega) / 2.0;
                b1_ = -(1.0 + cosOmega);
                b2_ = (1.0 + cosOmega) / 2.0;
                a0_ = 1.0 + alpha;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha;
                break;
                
            case BANDPASS:
                alpha = sinOmega / (2.0 * q);
                b0_ = alpha;
                b1_ = 0.0;
                b2_ = -alpha;
                a0_ = 1.0 + alpha;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha;
                break;
                
            case NOTCH:
                alpha = sinOmega / (2.0 * q);
                b0_ = 1.0;
                b1_ = -2.0 * cosOmega;
                b2_ = 1.0;
                a0_ = 1.0 + alpha;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha;
                break;
                
            case ALLPASS:
                alpha = sinOmega / (2.0 * q);
                b0_ = 1.0 - alpha;
                b1_ = -2.0 * cosOmega;
                b2_ = 1.0 + alpha;
                a0_ = 1.0 + alpha;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha;
                break;
                
            case PEAKING:
                double a = Math.pow(10.0, gain / 40.0);
                alpha = sinOmega / (2.0 * q);
                b0_ = 1.0 + alpha * a;
                b1_ = -2.0 * cosOmega;
                b2_ = 1.0 - alpha * a;
                a0_ = 1.0 + alpha / a;
                a1_ = -2.0 * cosOmega;
                a2_ = 1.0 - alpha / a;
                break;
                
            case LOWSHELF:
                double a_low = Math.pow(10.0, gain / 40.0);
                double sqrtA = Math.sqrt(a_low);
                alpha = sinOmega / 2.0 * Math.sqrt((a_low + 1.0 / a_low) * (1.0 / q - 1.0) + 2.0);
                b0_ = a_low * ((a_low + 1.0) - (a_low - 1.0) * cosOmega + 2.0 * sqrtA * alpha);
                b1_ = 2.0 * a_low * ((a_low - 1.0) - (a_low + 1.0) * cosOmega);
                b2_ = a_low * ((a_low + 1.0) - (a_low - 1.0) * cosOmega - 2.0 * sqrtA * alpha);
                a0_ = (a_low + 1.0) + (a_low - 1.0) * cosOmega + 2.0 * sqrtA * alpha;
                a1_ = -2.0 * ((a_low - 1.0) + (a_low + 1.0) * cosOmega);
                a2_ = (a_low + 1.0) + (a_low - 1.0) * cosOmega - 2.0 * sqrtA * alpha;
                break;
                
            case HIGHSHELF:
                double a_high = Math.pow(10.0, gain / 40.0);
                double sqrtA_high = Math.sqrt(a_high);
                alpha = sinOmega / 2.0 * Math.sqrt((a_high + 1.0 / a_high) * (1.0 / q - 1.0) + 2.0);
                b0_ = a_high * ((a_high + 1.0) + (a_high - 1.0) * cosOmega + 2.0 * sqrtA_high * alpha);
                b1_ = -2.0 * a_high * ((a_high - 1.0) + (a_high + 1.0) * cosOmega);
                b2_ = a_high * ((a_high + 1.0) + (a_high - 1.0) * cosOmega - 2.0 * sqrtA_high * alpha);
                a0_ = (a_high + 1.0) - (a_high - 1.0) * cosOmega + 2.0 * sqrtA_high * alpha;
                a1_ = 2.0 * ((a_high - 1.0) - (a_high + 1.0) * cosOmega);
                a2_ = (a_high + 1.0) - (a_high - 1.0) * cosOmega - 2.0 * sqrtA_high * alpha;
                break;
                
            default:
                b0_ = 1.0;
                b1_ = 0.0;
                b2_ = 0.0;
                a0_ = 1.0;
                a1_ = 0.0;
                a2_ = 0.0;
                break;
        }
        
        // Normalize coefficients
        b0 = b0_ / a0_;
        b1 = b1_ / a0_;
        b2 = b2_ / a0_;
        a1 = a1_ / a0_;
        a2 = a2_ / a0_;
    }
}
