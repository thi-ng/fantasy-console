const buf = new Uint32Array(HEIGHT);
const title = "!!! RASTERBARS !!!";
let t = 0;

const bars = [
	[0xff00c0, 0xd000b0, 0xb00080, 0x900090, 0x700070, 0x400040],
	[0xc000f0, 0xa000c0, 0x600080, 0x200040],
	[0x00ffff, 0x00c0ff, 0x0060c0, 0x004080, 0x000040],
	[0x00ffff, 0x00ffc0, 0x00c060, 0x008040, 0x004000],
	[0xffff00, 0xa0a000, 0x505000],
	[0xffc000, 0xff8000, 0xc06000, 0x804000, 0x402000],
	[0xff0000, 0xd00000, 0xb00000, 0x900000, 0x700000, 0x500000, 0x300000],
];

function bar(y, cols) {
	const n = cols.length;
	y = fit(y, -1, 1, n, HEIGHT - 1 - n) | 0;
	for (let i = 0; i < n; i++) {
		buf[y - i] = buf[y + i] = cols[i];
	}
}

function BOOT() {
	text(title, W2, H2 - 4, 12, 15, "c");
	text("(NO DRAWING, ONLY HSYNC)", W2, H2 + 12, 13, 15, "c");
}

function TICK() {
	buf.fill(0);
	t = peek32(FRAME);
	for (let i = 0; i < bars.length; i++) {
		bar(cos(t * 0.02 + i * 0.2), bars[i]);
	}
}

function HSYNC(y) {
	poke32(PALETTE, buf[y] || ((y + t) & 0xf) * 0x020202);
}
