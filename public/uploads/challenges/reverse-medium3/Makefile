CC = gcc
CFLAGS = -Wall -O2

all: license.exe

license.exe: license.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f license.exe
