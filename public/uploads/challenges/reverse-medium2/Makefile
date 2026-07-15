CC = gcc
CFLAGS = -Wall -O2

all: repair.exe

repair.exe: repair.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f repair.exe
