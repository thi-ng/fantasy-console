import type { Nullable } from "@thi.ng/api";
import { swapLane13 } from "@thi.ng/binary";
import { isString } from "@thi.ng/checks";
import {
	circleClipped,
	clipped,
	hlineClipped,
	lineClipped,
	rows2d,
	vlineClipped,
} from "@thi.ng/grid-iterators";
import { fit as __fit, fitClamped } from "@thi.ng/math";
import { canvasPixels, type RawPixelBuffer } from "@thi.ng/pixel";
import { XsAdd } from "@thi.ng/random";
import { resolve } from "@thi.ng/resolve-map";
import { KEY_ALIASES, KEY_MAP, type Memory, type UserProgram } from "./api";
import { DEFAULT_FONT } from "./font";
import { SWEETIE16 } from "./palettes";

export const MEM = resolve<Memory>({
	RAM_SIZE: 0x10000,
	STACK_SIZE: 0x0100,
	DS_BASE: ({ STACK_SIZE }: Memory) => STACK_SIZE,
	RS_BASE: ({ DS_BASE, STACK_SIZE }: Memory) => DS_BASE + STACK_SIZE,

	DEVICE_BASE: 0x400,

	CLOCK_BASE: ({ DEVICE_BASE }: Memory) => DEVICE_BASE,
	TIMER: ({ CLOCK_BASE }: Memory) => CLOCK_BASE,
	FRAME: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 4,
	YEAR: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 8,
	MONTH: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 10,
	DAY: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 11,
	WEEK_DAY: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 12,
	HOUR: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 13,
	MINUTE: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 14,
	SECOND: ({ CLOCK_BASE }: Memory) => CLOCK_BASE + 15,

	MOUSE_BASE: ({ DEVICE_BASE }: Memory) => DEVICE_BASE + 16,
	MOUSEX: ({ MOUSE_BASE }: Memory) => MOUSE_BASE,
	MOUSEY: ({ MOUSE_BASE }: Memory) => MOUSE_BASE + 2,
	MOUSE_BUTTONS: ({ MOUSE_BASE }: Memory) => MOUSE_BASE + 4,
	MOUSE_WHEEL: ({ MOUSE_BASE }: Memory) => MOUSE_BASE + 5,
	PMOUSE_BASE: ({ MOUSE_BASE }: Memory) => MOUSE_BASE + 8,
	PMOUSEX: ({ PMOUSE_BASE }: Memory) => PMOUSE_BASE,
	PMOUSEY: ({ PMOUSE_BASE }: Memory) => PMOUSE_BASE + 2,
	PMOUSE_BUTTONS: ({ PMOUSE_BASE }: Memory) => PMOUSE_BASE + 4,
	PMOUSE_WHEEL: ({ PMOUSE_BASE }: Memory) => PMOUSE_BASE + 5,

	KEYBOARD_BASE: ({ DEVICE_BASE }: Memory) => DEVICE_BASE + 32,
	KEYS: ({ KEYBOARD_BASE }: Memory) => KEYBOARD_BASE,
	PKEYS: ({ KEYBOARD_BASE }: Memory) => KEYBOARD_BASE + 8,

	VRAM_BASE: 0x1000,
	VRAM_SIZE: ({
		PIXEL_BUF_SIZE,
		PALETTE_SIZE,
		FONT_SIZE,
		SPRITE_SIZE,
	}: Memory) => PIXEL_BUF_SIZE + PALETTE_SIZE + FONT_SIZE + SPRITE_SIZE,
	PIXELS: ({ VRAM_BASE }: Memory) => VRAM_BASE,
	PIXELS_END: ({ PIXELS, PIXEL_BUF_SIZE }: Memory) => PIXELS + PIXEL_BUF_SIZE,
	STRIDE: ({ WIDTH }: Memory) => WIDTH >> 1,
	PIXEL_BUF_SIZE: ({ WIDTH, HEIGHT }: Memory) => (WIDTH * HEIGHT) >> 1,
	PALETTE: ({ PIXELS, PIXEL_BUF_SIZE }: Memory) => PIXELS + PIXEL_BUF_SIZE,
	FONT_BASE: ({ PALETTE, PALETTE_SIZE }: Memory) => PALETTE + PALETTE_SIZE,
	SPRITE_BASE: ({ FONT_BASE, FONT_SIZE }: Memory) => FONT_BASE + FONT_SIZE,
	WIDTH: 240,
	HEIGHT: 135,
	PALETTE_SIZE: 16 * 4,
	FONT_SIZE: 256 * 9,
	SPRITE_SIZE: 256 * 4 * 8,

	USER_CODE: ({ VRAM_BASE, VRAM_SIZE }: Memory) => VRAM_BASE + VRAM_SIZE,
	USER_CODE_END: ({ FREE_BASE }: Memory) => FREE_BASE - 1,

	FREE_BASE: 0xc000,
});

export const u8 = new Uint8Array(MEM.RAM_SIZE);
export const u16 = new Uint16Array(u8.buffer);
export const u32 = new Uint32Array(u8.buffer);

export let canvas: HTMLCanvasElement;
let vramOut: RawPixelBuffer;

const palette = u32.subarray(
	MEM.PALETTE >> 2,
	(MEM.PALETTE + MEM.PALETTE_SIZE) >> 2
);
const fontData = u8.subarray(MEM.FONT_BASE, MEM.FONT_BASE + MEM.FONT_SIZE);

const __rnd = new XsAdd();

export const reset = () => {
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.width = MEM.WIDTH;
		canvas.height = MEM.HEIGHT;
		canvas.addEventListener("mousemove", __updateMouse);
		canvas.addEventListener("mousedown", __updateMouse);
		canvas.addEventListener("mouseup", __updateMouse);
		canvas.addEventListener("contextmenu", (e) => e.preventDefault());
		window.addEventListener("keydown", __updateKeys);
		window.addEventListener("keyup", __updateKeys);
		vramOut = canvasPixels(canvas);
	}
	u8.fill(0);
	seed(Date.now());
	palette.set(SWEETIE16);
	fontData.set(DEFAULT_FONT);
	return canvas;
};

export const tick = ({ tick, hsync, vsync }: UserProgram) => {
	const { ctx, img, data: pixels } = vramOut;
	const { PIXELS, HEIGHT, STRIDE } = MEM;
	__updateClock();
	tick && tick();
	for (let i = 0, src = PIXELS, dest = 0; i < HEIGHT; i++) {
		hsync && hsync(i);
		for (let x = 0; x < STRIDE; x++) {
			const val = u8[src++];
			pixels[dest++] = swapLane13(palette[val >> 4] | 0xff000000);
			pixels[dest++] = swapLane13(palette[val & 0xf] | 0xff000000);
		}
	}
	ctx.putImageData(img, 0, 0);
	vsync && vsync();
	u8.copyWithin(MEM.PMOUSE_BASE, MEM.MOUSE_BASE, MEM.PMOUSE_BASE);
	u8.copyWithin(MEM.PKEYS, MEM.KEYS, MEM.PKEYS);
};

export const compile = (src: string) => {
	const encode = new TextEncoder();
	const buf = u8.subarray(MEM.USER_CODE, MEM.USER_CODE_END);
	buf.fill(0);
	encode.encodeInto(src, buf);
	src = src.replace(
		new RegExp(`\\b(${Object.keys(__env).join("|")})\\(`, "g"),
		(_, x) => `__env.${x}(`
	);
	src = src.replace(
		new RegExp(`\\b(${Object.keys(MEM).join("|")})\\b`, "g"),
		(_, x) => `__mem.${x}`
	);
	console.log(src);
	const prog = new Function(
		"__env,__mem",
		`${src};
	return {
		tick: typeof tick !== "undefined" ? tick : undefined,
		hsync: typeof hsync !== "undefined" ? hsync : undefined,
		vsync: typeof vsync !== "undefined" ? vsync : undefined,
	};`
	)(__env, MEM);
	console.log(prog);
	return prog;
};

const __updateClock = () => {
	u32[MEM.TIMER >> 2] = performance.now();
	u32[MEM.FRAME >> 2]++;
	const now = new Date();
	u16[MEM.YEAR >> 1] = now.getFullYear();
	u8[MEM.MONTH] = now.getMonth() + 1;
	u8[MEM.DAY] = now.getDate() + 1;
	u8[MEM.WEEK_DAY] = now.getDay();
	u8[MEM.HOUR] = now.getHours();
	u8[MEM.MINUTE] = now.getMinutes();
	u8[MEM.SECOND] = now.getSeconds();
};

const __updateMouse = (e: MouseEvent) => {
	const bounds = (<HTMLElement>e.target).getBoundingClientRect();
	u8[MEM.MOUSEX] = fitClamped(
		e.clientX,
		bounds.left,
		bounds.right,
		0,
		MEM.WIDTH
	);
	u8[MEM.MOUSEY] = fitClamped(
		e.clientY,
		bounds.top,
		bounds.bottom,
		0,
		MEM.HEIGHT
	);
	u8[MEM.MOUSE_BUTTONS] = e.buttons;
};

const __updateKeys = (e: KeyboardEvent) => {
	const code = KEY_ALIASES[<keyof typeof KEY_ALIASES>e.code] || e.code;
	const bit = KEY_MAP[<keyof typeof KEY_MAP>code];
	// console.log(e.key, e.code, code, bit);
	if (bit === undefined) return;
	const addr = MEM.KEYS + (bit >> 3);
	u8[addr] =
		e.type === "keydown"
			? setBit(u8[addr], bit & 7)
			: clearBit(u8[addr], bit & 7);
};

// API

export const poke = (addr: number, x: number) => (u8[addr] = x);

export const poke4 = (addr4: number, x: number) => {
	const addr = addr4 >> 1;
	u8[addr] = addr4 & 1 ? (u8[addr] & 0xf0) | x : (u8[addr] & 0xf) | (x << 4);
};

export const peek = (addr: number) => u8[addr];

export const peek4 = (addr4: number) =>
	addr4 & 1 ? u8[addr4 >> 1] & 0xf : u8[addr4 >> 1] >> 4;

export const peek16 = (addr: number) => u16[addr >> 1];

export const peek32 = (addr: number) => u32[addr >> 2];

export const setBit = (x: number, bit: number) => x | (1 << bit);

export const bitSet = (x: number, bit: number) => !!(x & (1 << bit));

export const clearBit = (x: number, bit: number) => x & ~(1 << bit);

export const memset = (addr: number, len: number, x: number) =>
	u8.fill(x, addr, addr + len);

export const keyp = (id: number | string) => {
	let bit: number;
	if (isString(id)) {
		bit = KEY_MAP[<keyof typeof KEY_MAP>id];
		if (bit === undefined) return false;
	} else {
		bit = id;
	}
	const mask = 1 << (bit & 7);
	bit >>= 3;
	return u8[MEM.KEYS + bit] & mask & ~(u8[MEM.PKEYS + bit] & mask);
};

export const code = () => {
	const decoder = new TextDecoder();
	const buf = u8.subarray(MEM.USER_CODE, MEM.USER_CODE_END);
	return decoder.decode(
		buf.subarray(
			0,
			buf.findIndex((x) => x === 0)
		)
	);
};

export const cls = (col: number) =>
	u8.fill(col * 0x11, MEM.PIXELS, MEM.PIXELS_END);

export const setpixel = (x: number, y: number, col: number) => {
	if (x < 0 || x >= MEM.WIDTH || y < 0 || y >= MEM.HEIGHT) return;
	const idx = MEM.PIXELS + y * MEM.STRIDE + (x >> 1);
	u8[idx] = x & 1 ? (u8[idx] & 0xf0) | col : (u8[idx] & 0xf) | (col << 4);
};

export const __setpixel = (x: number, y: number, col: number) => {
	const idx = MEM.PIXELS + y * MEM.STRIDE + (x >> 1);
	u8[idx] = x & 1 ? (u8[idx] & 0xf0) | col : (u8[idx] & 0xf) | (col << 4);
};

export const getpixel = (x: number, y: number) => {
	if (x < 0 || x >= MEM.WIDTH || y < 0 || y >= MEM.HEIGHT) return;
	const val = u8[MEM.PIXELS + y * MEM.STRIDE + (x >> 1)];
	return x & 1 ? val & 0xf : val >> 4;
};

const __rasterize = (gen: Nullable<Iterable<number[]>>, col: number) => {
	if (!gen) return;
	for (let p of gen) __setpixel(p[0], p[1], col);
};

export const line = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	col: number
) => __rasterize(lineClipped(x1, y1, x2, y2, 0, 0, MEM.WIDTH, MEM.HEIGHT), col);

export const hline = (x: number, y: number, w: number, col: number) =>
	__rasterize(hlineClipped(x, y, w, 0, 0, MEM.WIDTH, MEM.HEIGHT), col);

export const vline = (x: number, y: number, h: number, col: number) =>
	__rasterize(vlineClipped(x, y, h, 0, 0, MEM.WIDTH, MEM.HEIGHT), col);

export const circle = (
	x: number,
	y: number,
	r: number,
	col: number,
	fill = 0
) =>
	__rasterize(
		circleClipped(x, y, r, 0, 0, MEM.WIDTH, MEM.HEIGHT, !!fill),
		col
	);

export const rect = (
	x1: number,
	y1: number,
	w: number,
	h: number,
	col: number,
	fill = 0
) => {
	if (fill) {
		__rasterize(
			clipped(
				rows2d({
					cols: w,
					rows: h,
					tx: () => (x, y) => [x + x1, y + y1],
				}),
				0,
				0,
				MEM.WIDTH,
				MEM.HEIGHT
			),
			col
		);
	} else {
		const x2 = x1 + w;
		const y2 = y1 + h;
		hline(x1, y1, w, col);
		hline(x1, y2, w, col);
		vline(x1, y1, h, col);
		vline(x2, y1, h + 1, col);
	}
};

export const ellipse = (
	x: number,
	y: number,
	rx: number,
	ry: number,
	col: number,
	fill = 0
) => {
	x |= 0;
	y |= 0;
	rx |= 0;
	ry |= 0;
	let x0 = x - rx;
	let x1 = x + rx;
	let y0 = y - ry;
	let y1 = y + ry;
	// diameters
	let a = Math.abs(x1 - x0),
		b = Math.abs(y1 - y0),
		b1 = b & 1;
	// error increment
	let dx = 4 * (1 - a) * b * b,
		dy = 4 * (b1 + 1) * a * a;
	// error of 1.step
	let err = dx + dy + b1 * a * a,
		e2;

	y0 += (b + 1) >> 1;
	y1 = y0 - b1; // starting pixel
	a *= 8 * a;
	b1 = 8 * b * b;

	do {
		if (fill) {
			hline(x0, y0, x1 - x0, col);
			hline(x0, y1, x1 - x0, col);
		} else {
			setpixel(x1, y0, col); //   I. Quadrant
			setpixel(x0, y0, col); //  II. Quadrant
			setpixel(x0, y1, col); // III. Quadrant
			setpixel(x1, y1, col); //  IV. Quadrant
		}
		e2 = err * 2;
		// y step
		if (e2 <= dy) {
			y0++;
			y1--;
			err += dy += a;
		}
		// x step
		if (e2 >= dx || 2 * err > dy) {
			x0++;
			x1--;
			err += dx += b1;
		}
	} while (x0 <= x1);

	while (y0 - y1 < b) {
		// too early stop of flat ellipses a=1
		setpixel(x0 - 1, y0, col); // finish tip of ellipse
		setpixel(x1 + 1, y0++, col);
		setpixel(x0 - 1, y1, col);
		setpixel(x1 + 1, y1--, col);
	}
};

export const scrollv = (delta: number) => {
	const { PIXELS, PIXELS_END, STRIDE } = MEM;
	delta *= STRIDE;
	delta > 0
		? u8.copyWithin(PIXELS, PIXELS + delta, PIXELS_END)
		: u8.copyWithin(PIXELS - delta, PIXELS, PIXELS_END + delta);
};

export const cycle = (start: number, end: number, delta: number) => {
	if (delta < 0) {
		const x = u8.slice(end + delta, end);
		u8.copyWithin(start - delta, start, end + delta);
		u8.set(x, start);
	} else {
		const x = u8.slice(start, start + delta);
		u8.copyWithin(start, start + delta, end);
		u8.set(x, end - delta);
	}
};

export const text = (
	str: string,
	x: number,
	y: number,
	col: number,
	shadow = -1,
	lineHeight = 8
) => {
	if (shadow !== -1) text(str, x + 1, y, shadow, -1, lineHeight);
	col &= 0xf;
	const col4 = col << 4;
	const origX = x;
	const { PIXELS, STRIDE, WIDTH, HEIGHT } = MEM;
	let h = Math.min(8, HEIGHT - y);
	for (
		let i = 0, dest = PIXELS + y * STRIDE + (x >> 1);
		i < str.length;
		i++
	) {
		const code = str.charCodeAt(i) & 0xff;
		if (code === 10) {
			y += lineHeight;
			h = Math.min(8, HEIGHT - y);
			if (h < 1) return;
			x = origX;
			dest = PIXELS + y * STRIDE + (x >> 1);
			continue;
		}
		if (x >= WIDTH) continue;
		let src = code * 9;
		const charW = Math.min(fontData[src], WIDTH - x);
		if (!charW) continue;
		src++;
		for (let j = 0, d = dest; j < h; j++, src++, d += STRIDE) {
			const v = fontData[src];
			if (!v) continue;
			for (let k = 0, dd = d, xx = x; k < charW; k++, xx++) {
				if (v & (1 << (7 - k))) {
					u8[dd] =
						xx & 1 ? (u8[dd] & 0xf0) | col : (u8[dd] & 0x0f) | col4;
				}
				xx & 1 && dd++;
			}
		}
		x += charW;
		dest += charW >> 1;
		charW & 1 && !(x & 1) && dest++;
	}
};

export const hit = (
	mx: number,
	my: number,
	x: number,
	y: number,
	w: number,
	h: number
) => mx >= x && mx < x + w && my >= y && my < y + h;

export const hitm = (x: number, y: number, w: number, h: number) =>
	hit(peek(MEM.MOUSEX), peek(MEM.MOUSEY), x, y, w, h);

export const rnd = (max = 255) => __rnd.int() % max >>> 0;

export const seed = (x: number) => __rnd.seed(x);

export const fit = __fit;
export const fitc = fitClamped;

export const dist = (x1: number, y1: number, x2: number, y2: number) =>
	Math.hypot(x2 - x1, y2 - y1);

export const abs = Math.abs;
export const sin = Math.sin;
export const cos = Math.cos;
export const pow = Math.pow;
export const sqrt = Math.sqrt;
export const min = Math.min;
export const max = Math.max;

const __env = {
	poke,
	poke4,
	peek,
	peek4,
	setBit,
	bitSet,
	clearBit,
	memset,
	code,
	keyp,
	cls,
	setpixel,
	getpixel,
	line,
	hline,
	vline,
	circle,
	ellipse,
	rect,
	scrollv,
	cycle,
	text,
	hit,
	hitm,
	rnd,
	seed,
	fit,
	fitc,
	dist,
	abs,
	sin,
	cos,
	pow,
	sqrt,
	min,
	max,
};
