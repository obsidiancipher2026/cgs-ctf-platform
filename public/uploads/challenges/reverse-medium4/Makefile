CC = gcc
CFLAGS = -Wall -O2

all: packed.exe

packed.exe: packed.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f packed.exe
