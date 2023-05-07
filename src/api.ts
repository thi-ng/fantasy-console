import type { Fn, Fn0 } from "@thi.ng/api";

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

	Comma: 36,
	Period: 37,
	Slash: 38,
	Semicolon: 39,
	Quote: 40,
	BracketLeft: 41,
	BracketRight: 42,
	Minus: 43,
	Equal: 44,
	Backquote: 45,
	Backslash: 46,

	Escape: 47,
	Enter: 48,
	Backspace: 49,
	Delete: 50,
	Tab: 51,
	CapsLock: 52,

	F1: 53,
	F2: 54,
	F3: 55,
	F4: 56,
	F5: 57,
	F6: 58,

	Shift: 60,
	Control: 61,
	Alt: 62,
	Meta: 63,
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
	hsync?: Fn<number, void>;
	vsync?: Fn0<void>;
	tick?: Fn0<void>;
}
