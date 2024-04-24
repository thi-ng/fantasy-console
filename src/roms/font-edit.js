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
const sampleX = viewX;
const sampleY = viewY + 72;
const saveX = viewX + 66;
const saveY = viewY + 56;
const okX = 160 - (3 * 8) / 2;
const okY = 92;
let mx, my;
let cx = -1;
let cy = -1;

let sel = 65;
let sampleID = 0;
let flash = 0;
let modal = 0;

function charGrid() {
	rect(gridX, gridY, 128, 128, 14);
	rect(gridX + (sel % 16) * 8, gridY + (sel >> 4) * 8, 8, 8, 0, 1);
	for (let i = 0; i < 256; i++) {
		let xx = gridX + (i & 15) * 8;
		let yy = gridY + (i >> 4) * 8;
		text(String.fromCharCode(i), xx, yy, 12);
		setpixel(xx + max(0, peek(FONT_BASE + i * 9) - 1), yy, 2);
	}
}

function charView() {
	rect(viewX, viewY, 64, 64, 14);
	let addr = FONT_BASE + sel * 9;
	const w = peek(addr++);
	let markerX = viewX + max(0, w - 1) * 8 + 4;
	for (let y = 0; y < 8; y++) {
		let row = peek(addr + y);
		for (let x = 0; x < 8; x++) {
			if (bitTest(row, 7 - x)) {
				rect(viewX + x * 8, viewY + y * 8, 8, 8, 12, 1);
			} else {
				setpixel(viewX + x * 8 + 4, viewY + y * 8 + 4, 14);
			}
		}
	}
	if (cx >= 0) rect(viewX + cx * 8, viewY + cy * 8, 8, 8, 3);
	setpixel(markerX, viewY + 66, 2);
	hline(markerX - 1, viewY + 67, 3, 2);
	hline(markerX - 2, viewY + 68, 5, 2);
	text(`ID:\nW:`, viewX + 66, viewY, 12, 0);
	text(`${sel}\n${w}`, viewX + 78, viewY, 12, 0);
}

function sampleView() {
	tile1(14, sampleX, sampleY, 1);
	tile1(15, sampleX + 56, sampleY, 1);
	text("SAMPLE", sampleX + 10, sampleY, 12, 0);
	text(samples[sampleID], sampleX, sampleY + 10, 12, 0);
}

function button(label, x, y, w) {
	const ids = new Array(w).fill(3);
	ids[0] = 2;
	ids[w - 1] = 4;
	tiles(ids, x, y, 1);
	text(label, x + ((w * 8 - textWidth(label)) >> 1), y, 12);
}

function TICK() {
	if (flash) {
		cls(2);
		flash--;
	} else cls(15);
	mx = peek16(MOUSEX);
	my = peek16(MOUSEY);
	bt = peek(MOUSE_BUTTONS);
	pbt = peek(PMOUSE_BUTTONS);
	if (!modal) {
		if (bt & 1) {
			if (hitm(gridX, gridY, 128, 128)) {
				sel = ((my - gridY) >> 3) * 16 + ((mx - gridX) >> 3);
			} else if (hitm(viewX, viewY, 64, 64)) {
				let addr = FONT_BASE + sel * 9 + 1 + ((my - viewY) >> 3);
				poke(addr, peek(addr) | (1 << (7 - ((mx - viewX) >> 3))));
			} else if (hitm(viewX, viewY + 66, 64, 8)) {
				poke(FONT_BASE + sel * 9, 1 + ((mx - viewX) >> 3));
			} else if (!(pbt & 1)) {
				if (hitm(saveX, saveY, 32, 8)) {
					saveMemory("font", FONT_BASE, FONT_SIZE);
					modal = 1;
				} else if (hitm(sampleX, sampleY, 8, 8)) {
					sampleID = max(0, sampleID - 1);
				} else if (hitm(sampleX + 56, sampleY, 8, 8)) {
					sampleID = min(samples.length - 1, sampleID + 1);
				}
			}
		}
		if (hitm(viewX, viewY, 64, 64)) {
			cx = (mx - viewX) >> 3;
			cy = (my - viewY) >> 3;
			if (bt & 2) {
				let addr = FONT_BASE + sel * 9 + 1 + cy;
				poke(addr, bitClear(peek(addr), 7 - cx));
			}
		} else {
			cx = cy = -1;
		}
		if (keyp("Backspace") || keyp("Delete")) {
			memset(FONT_BASE + sel * 9 + 1, 8, 0);
			flash = 4;
		} else {
			const ascii = allKeysA();
			if (ascii.length) sel = ascii[0];
		}
	} else {
		if (
			keyp("Enter") ||
			keyp("Escape") ||
			(bt & 1 && hitm(okX, okY, 24, 8))
		) {
			modal = 0;
		}
	}

	charGrid();
	charView();
	sampleView();

	button("SAVE", saveX, saveY, 4);

	if (modal) {
		// semi-transparent bg
		tileFill(16, 1);
		// dialog box
		tile9(5, 120, 74, 10, 4, 1);
		text("FONT SAVED.", 160, 82, 12, -1, "c");
		button("OK", okX, okY, 3);
	}
	// mouse cursor
	tile1(0, mx - 1, my - 1, 1);
}
