let x = W2;
let y = H2;

function HSYNC(y) {
	poke(PALETTE, y);
	poke(PALETTE + 1, y >> 1);
	poke(PALETTE + 2, y >> 3);
}

function TICK() {
	if (keyp("KeyX")) cls();
	if (peek(MOUSE_BUTTONS) & 1 && !(peek(FRAME) & 3)) {
		cycle(PALETTE + 4, PALETTE + PALETTE_SIZE - 4, -4);
	}
	if (peek(MOUSE_BUTTONS) & 2) scrollv(1);
	x = mix(x, peek16(MOUSEX), 0.2) | 0;
	y = mix(y, peek16(MOUSEY), 0.2) | 0;
	const r = fitc(dist(x, y, peek(PMOUSEX), peek(PMOUSEY)), 0, 12, 2, 15);
	const col = ((peek(FRAME) >> 2) % 14) + 1;
	circle(x, y, r, col, 1);
	rect(0, 0, WIDTH, 7, 15, 1);
	const hour = pad2(peek(HOUR));
	const min = pad2(peek(MINUTE));
	const sec = pad2(peek(SECOND));
	text(`${hour}:${min}:${sec}`, 0, 0, 4, 0);
	text(`X: ${pad3(x)}`, 50, 0, 12, 0);
	text(`Y: ${pad3(y)}`, 82, 0, 12, 0);
	text("CLICK & DRAG TO CYCLE", WIDTH - 1, 0, 13, 0, "r");
}
