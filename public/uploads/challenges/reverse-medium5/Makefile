CC = gcc
CFLAGS = -Wall -O2

all: analyst.exe

analyst.exe: analyst.c
	$(CC) $(CFLAGS) -o $@ $< -lkernel32

clean:
	rm -f analyst.exe
