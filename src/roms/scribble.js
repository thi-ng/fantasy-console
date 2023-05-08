for (let x = 0; x < WIDTH / 2; x++) {
	poke(PIXELS + x, (x & 0xf) * 0x11);
	setpixel(x * 2, 2, x & 0xf);
	setpixel(x * 2 + 1, 3, x & 0xf);
}

// for (let i = 0; i < 1000; i++)
// 	CIRCLE(RANDOM(WIDTH), RANDOM(HEIGHT), 8, i & 15, 1);

function HSYNC(y) {
	poke(PALETTE, y);
	poke(PALETTE + 1, y / 2);
	poke(PALETTE + 2, y / 8);
}

function TICK() {
	if (peek(MOUSE_BUTTONS) & 1 && !(peek(FRAME) % 4)) {
		cycle(PALETTE + 4, PALETTE + PALETTE_SIZE - 4, -4);
	}
	if (peek(MOUSE_BUTTONS) & 2) scrollv(1);
	const x = peek(MOUSEX);
	const y = peek(MOUSEY);
	const r = fitc(dist(x, y, peek(PMOUSEX), peek(PMOUSEY)), 0, 10, 2, 12);
	const col = ((peek(FRAME) / 4) % 14) + 1;
	circle(x, y, r, col, 1);
	rect(0, 0, WIDTH, 7, 15, 1);
	const hour = pad2(peek(HOUR));
	const min = pad2(peek(MINUTE));
	const sec = pad2(peek(SECOND));
	text(`${hour}:${min}:${sec}`, 0, 0, 4, 0);
	text(`X: ${pad3(x)} Y: ${pad3(y)}`, 50, 0, 12, 0, 6);
}

function VSYNC() {
	if (keyp("ArrowDown")) saveFrame("scribble");
}
