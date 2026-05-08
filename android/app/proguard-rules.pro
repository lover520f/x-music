# Add project specific ProGuard rules here.

-keep class com.reactnativenavigation.views.element.animators.** { *; }
-keep class org.jaudiotagger.tag.** { *; }
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# Keep MoeKoe EQ NativeModule
-keep class com.my.music.moblie.soundeffect.moekoe.** { *; }
