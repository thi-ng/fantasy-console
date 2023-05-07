const samples = [
	"THE QUICK BROWN\nFOX JUMPED OVER\nTHE LAZY DOG",
	"The quick brown\nfox jumped over\nthe lazy dog",
	"FRANZ JAGT IM\nKOMPLETT\nVERWAHRLOSTEN\nTAXI QUER\nDURCH BAYERN",
	"Franz jagt im komplett\nverwahrlosten Taxi\nquer durch Bayern",
];

const gridX = 108;
const gridY = 3;
const viewX = 3;
const viewY = 3;
let sel = 65;
let sampleID = 0;
let mx, my;
let cx = -1,
	cy = -1;

function charGrid() {
	for (let i = 0; i < 256; i++) {
		let xx = gridX + (i & 15) * 8;
		let yy = gridY + (i >> 4) * 8;
		text(String.fromCharCode(i), xx, yy, 12);
		setpixel(xx + max(0, peek(FONT_BASE + i * 9) - 1), yy, 2);
	}
}

function charView() {
	let addr = FONT_BASE + sel * 9;
	let w = max(0, peek(addr++) - 1) * 8 + 4;
	for (let y = 0; y < 8; y++) {
		let row = peek(addr + y);
		for (let x = 0; x < 8; x++) {
			if (bitSet(row, 7 - x)) {
				rect(viewX + x * 8, viewY + y * 8, 8, 8, 12, 1);
			} else {
				setpixel(viewX + x * 8 + 4, viewY + y * 8 + 4, 14);
			}
		}
	}
	if (cx >= 0) rect(viewX + cx * 8, viewY + cy * 8, 8, 8, 3);
	setpixel(viewX + w, viewY + 66, 2);
	hline(viewX + w - 1, viewY + 67, 3, 2);
	hline(viewX + w - 2, viewY + 68, 5, 2);
	text(`#${sel}`, viewX + 66, viewY, 12, 0);
}

function tick() {
	cls(15);
	mx = peek(MOUSEX);
	my = peek(MOUSEY);
	bt = peek(MOUSE_BUTTONS);
	if (bt & 1) {
		if (hitm(gridX, gridY, 128, 128)) {
			sel = ((my - gridY) >> 3) * 16 + ((mx - gridX) >> 3);
		} else if (hitm(viewX, viewY, 64, 64)) {
			let addr = FONT_BASE + sel * 9 + 1 + ((my - viewY) >> 3);
			poke(addr, peek(addr) | (1 << (7 - ((mx - viewX) >> 3))));
		} else if (hitm(viewX, viewY + 66, 64, 8)) {
			poke(FONT_BASE + sel * 9, 1 + ((mx - viewX) >> 3));
		}
	}
	if (hitm(viewX, viewY, 64, 64)) {
		cx = (mx - viewX) >> 3;
		cy = (my - viewY) >> 3;
		if (bt & 2) {
			let addr = FONT_BASE + sel * 9 + 1 + cy;
			poke(addr, clearBit(peek(addr), 7 - cx));
		}
	} else {
		cx = cy = -1;
	}
	for (let i = 1; i <= samples.length; i++) {
		if (keyp(i)) {
			sampleID = i - 1;
			break;
		}
	}
	if (keyp("Backspace") || keyp("Delete")) {
		memset(FONT_BASE + sel * 9 + 1, 8, 0);
	}
	rect(viewX, viewY, 64, 64, 14);
	rect(gridX, gridY, 128, 128, 14);
	rect(gridX + (sel % 16) * 8, gridY + (sel >> 4) * 8, 8, 8, 0, 1);
	charGrid();
	charView();
	text(samples[sampleID], viewX, viewY + 80, 12, 0);
}
