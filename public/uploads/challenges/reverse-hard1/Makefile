CC = gcc
CFLAGS = -Wall -O2

all: phoenix_protocol.exe

phoenix_protocol.exe: phoenix_protocol.c
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f phoenix_protocol.exe
