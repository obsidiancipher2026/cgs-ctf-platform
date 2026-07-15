#include <stdio.h>
#include <windows.h>

int check_debugger() {
    return IsDebuggerPresent();
}

int check_remote_debugger() {
    BOOL is_debugged = FALSE;
    CheckRemoteDebuggerPresent(GetCurrentProcess(), &is_debugged);
    return is_debugged;
}

int check_timing() {
    LARGE_INTEGER freq, start, end;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&start);

    // Some computation
    volatile int x = 0;
    for (int i = 0; i < 1000000; i++) x += i;

    QueryPerformanceCounter(&end);
    double elapsed = (double)(end.QuadPart - start.QuadPart) / freq.QuadPart;

    // If running under debugger, timing will be different
    return elapsed > 0.1;  // threshold
}

int check_vm() {
    // Check for VM artifacts
    int cpuInfo[4];
    __cpuid(cpuInfo, 1);
    // Check hypervisor bit
    return (cpuInfo[2] & (1 << 31)) != 0;
}

int check_peb() {
    // Check PEB->BeingDebugged
    #ifdef _WIN32
    PPEB peb = (PPEB)__readgsqword(0x60);
    return peb->BeingDebugged;
    #else
    return 0;
    #endif
}

int main() {
    if (check_debugger()) { printf("Debugger detected.\n"); return 1; }
    if (check_remote_debugger()) { printf("Remote debugger.\n"); return 1; }
    if (check_timing()) { printf("Timing anomaly.\n"); return 1; }
    if (check_peb()) { printf("PEB check failed.\n"); return 1; }

    printf("CGS{debuggers_are_expected}\n");
    return 0;
}
