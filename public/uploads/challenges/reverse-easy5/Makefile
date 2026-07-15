CC = gcc
CFLAGS = -Wall -O2

all: encoded.exe

encoded.exe: encoded.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f encoded.exe
