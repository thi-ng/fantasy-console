let psys = [];

function make(x, y) {
	const speed = rnd(4) / 4 + 1;
	return {
		x,
		y,
		dx: (rnd() / 255 - 0.5) * 2 * speed,
		dy: (-rnd() / 192) * speed,
		col: rnd(15) + 1,
		xl: rnd() < 16,
	};
}

function update(p) {
	p.dx *= 0.995;
	p.dy += 0.02;
	p.x += p.dx;
	p.y += p.dy;
	return p;
}

function BOOT() {
	psys = [];
}

function TICK() {
	cls();
	const mx = peek16(MOUSEX);
	const my = peek16(MOUSEY);
	if (psys.length < 2000) {
		for (let i = 0; i < 50; i++) {
			psys.push(make(mx, my));
		}
	}
	for (let i = 0; i < psys.length; i++) {
		let p = update(psys[i]);
		if (p.y >= HEIGHT) {
			p = psys[i] = make(mx, my);
		}
		if (p.xl) {
			setpixel(p.x, p.y, 12);
			setpixel(p.x - 1, p.y, p.col);
			setpixel(p.x + 1, p.y, p.col);
			setpixel(p.x, p.y - 1, p.col);
			setpixel(p.x, p.y + 1, p.col);
		} else {
			setpixel(p.x, p.y, p.col);
		}
	}
	text(`${psys.length} PARTICLES`, 8, 8, 12);
}
