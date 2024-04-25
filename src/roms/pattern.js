let x;
let y;

function BOOT() {
	x = y = 0;
	// override characters `a` - `d` with custom symbols
	// prettier-ignore
	memset(FONT_BASE + 97 * 9, [
		8, // char width
		0b10000000,
		0b11000000,
		0b11100000,
		0b11110000,
		0b11111000,
		0b11111100,
		0b11111110,
		0b11111111,
		8,
		0b00000001,
		0b00000011,
		0b00000111,
		0b00001111,
		0b00011111,
		0b00111111,
		0b01111111,
		0b11111111,
		8,
		0b10000000,
		0b11000000,
		0b01100000,
		0b00110000,
		0b00011000,
		0b00001100,
		0b00000110,
		0b00000011,
		8,
		0b00000001,
		0b00000011,
		0b00000110,
		0b00001100,
		0b00011000,
		0b00110000,
		0b01100000,
		0b11000000,
	]);
}

function TICK() {
	rect(x, y, 8, 8, 0, true);
	text("abcd"[rnd(4)], x, y, rnd(15) + 1);
	x += 8;
	if (x >= WIDTH) {
		x = 0;
		y += 8;
		if (y + 8 > HEIGHT) y = 0;
	}
	text("CUSTOM FONT!", W2, 88, 12, 15, "c");
	if (peek(MOUSE_BUTTONS) & 1 && !(peek(FRAME) & 3)) {
		cycle(PALETTE + 4, PALETTE + PALETTE_SIZE - 4, -4);
	}
}
