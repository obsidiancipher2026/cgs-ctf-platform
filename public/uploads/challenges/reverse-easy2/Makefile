CC = gcc
CFLAGS = -Wall -O2

all: xor_door.exe

xor_door.exe: xor_door.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f xor_door.exe
