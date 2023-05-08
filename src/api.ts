import type { Fn, Fn0, Keys } from "@thi.ng/api";

/*
STACK
	DATA
	RETURN
VRAM
	PIXELS
	PALETTE
	FONT
	SPRITES
IO DEVICE BLOCKS
	KEYBOARD
	MOUSE

*/

export interface Memory {
	RAM_SIZE: number;
	STACK_SIZE: number;
	DS_BASE: number;
	RS_BASE: number;

	DEVICE_BASE: number;

	CLOCK_BASE: number;
	TIMER: number;
	FRAME: number;
	YEAR: number;
	MONTH: number;
	DAY: number;
	WEEK_DAY: number;
	HOUR: number;
	MINUTE: number;
	SECOND: number;

	MOUSE_BASE: number;
	MOUSEX: number;
	MOUSEY: number;
	MOUSE_BUTTONS: number;
	MOUSE_WHEEL: number;
	PMOUSE_BASE: number;
	PMOUSEX: number;
	PMOUSEY: number;
	PMOUSE_BUTTONS: number;
	PMOUSE_WHEEL: number;

	KEYBOARD_BASE: number;
	KEYS: number;
	PKEYS: number;

	VRAM_BASE: number;
	VRAM_SIZE: number;
	PIXELS: number;
	PIXELS_END: number;
	WIDTH: number;
	HEIGHT: number;
	STRIDE: number;
	PIXEL_BUF_SIZE: number;
	PALETTE: number;
	PALETTE_SIZE: number;
	FONT_BASE: number;
	FONT_SIZE: number;
	SPRITE_BASE: number;
	SPRITE_SIZE: number;

	USER_CODE: number;
	USER_CODE_END: number;

	FREE_BASE: number;
}

export const KEY_MAP = {
	Digit0: 0,
	Digit1: 1,
	Digit2: 2,
	Digit3: 3,
	Digit4: 4,
	Digit5: 5,
	Digit6: 6,
	Digit7: 7,
	Digit8: 8,
	Digit9: 9,

	KeyA: 10,
	KeyB: 11,
	KeyC: 12,
	KeyD: 13,
	KeyE: 14,
	KeyF: 15,
	KeyG: 16,
	KeyH: 17,
	KeyI: 18,
	KeyJ: 19,
	KeyK: 20,
	KeyL: 21,
	KeyM: 22,
	KeyN: 23,
	KeyO: 24,
	KeyP: 25,
	KeyQ: 26,
	KeyR: 27,
	KeyS: 28,
	KeyT: 29,
	KeyU: 30,
	KeyV: 31,
	KeyW: 32,
	KeyX: 33,
	KeyY: 34,
	KeyZ: 35,

	Space: 36,
	Comma: 37,
	Period: 38,
	Slash: 39,
	Semicolon: 40,
	Quote: 41,
	BracketLeft: 42,
	BracketRight: 43,
	Minus: 44,
	Equal: 45,
	Backquote: 46,
	Backslash: 47,

	Escape: 48,
	Enter: 49,
	Backspace: 50,
	Delete: 51,
	Tab: 52,
	CapsLock: 53,

	ArrowLeft: 54,
	ArrowRight: 55,
	ArrowUp: 56,
	ArrowDown: 57,

	F1: 58,
	F2: 59,
	F3: 60,
	F4: 61,
	F5: 62,
	F6: 63,
	F7: 64,
	F8: 65,
	F9: 66,
	F10: 67,
	F11: 68,
	F12: 69,

	Shift: 70,
	Control: 71,
	Alt: 72,
	Meta: 73,
};

export const INV_KEY_MAP = Object.entries(KEY_MAP).reduce(
	(acc, [k, v]) => ((acc[v] = <any>k), acc),
	<Keys<typeof KEY_MAP>[]>[]
);

export const KEYS_TO_ASCII: Partial<Record<Keys<typeof KEY_MAP>, number>> = {
	Digit0: 48,
	Digit1: 49,
	Digit2: 50,
	Digit3: 51,
	Digit4: 52,
	Digit5: 53,
	Digit6: 54,
	Digit7: 55,
	Digit8: 56,
	Digit9: 57,
	KeyA: 65,
	KeyB: 66,
	KeyC: 67,
	KeyD: 68,
	KeyE: 69,
	KeyF: 70,
	KeyG: 71,
	KeyH: 72,
	KeyI: 73,
	KeyJ: 74,
	KeyK: 75,
	KeyL: 76,
	KeyM: 77,
	KeyN: 78,
	KeyO: 79,
	KeyP: 80,
	KeyQ: 81,
	KeyR: 82,
	KeyS: 83,
	KeyT: 84,
	KeyU: 85,
	KeyV: 86,
	KeyW: 87,
	KeyX: 88,
	KeyY: 89,
	KeyZ: 90,

	Space: 32,
	Quote: 39,
	Comma: 44,
	Minus: 45,
	Period: 46,
	Slash: 47,
	Semicolon: 59,
	Equal: 61,
	BracketLeft: 91,
	Backslash: 92,
	BracketRight: 93,
	Backquote: 96,
};

export const KEY_ALIASES = {
	ShiftLeft: "Shift",
	ShiftRight: "Shift",
	ControlLeft: "Control",
	ControlRight: "Control",
	AltLeft: "Alt",
	AltRight: "Alt",
	MetaLeft: "Meta",
	MetaRight: "Meta",
};

export interface UserProgram {
	BOOT?: Fn0<void>;
	HSYNC?: Fn<number, void>;
	VSYNC?: Fn0<void>;
	TICK?: Fn0<void>;
}
