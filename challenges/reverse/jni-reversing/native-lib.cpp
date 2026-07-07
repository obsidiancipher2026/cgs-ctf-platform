#include <jni.h>
#include <string.h>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_FlagChecker_nativeCheck(JNIEnv *env, jobject thiz, jstring input) {
    return (*env).NewStringUTF("CGS{...}");
}
