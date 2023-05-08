import { MEM, code, compile, keyp, reset, tick } from "./machine";
import FONT_EDIT_SRC from "./roms/font-edit.js?raw";
import SCRIBBLE_SRC from "./roms/scribble.js?raw";

document.body.appendChild(reset());

// u32.set(RAYLEIGH, PALETTE >> 2);

const SCRIBBLE = compile(SCRIBBLE_SRC);
const FONT_EDITOR = compile(FONT_EDIT_SRC);

let PROG = SCRIBBLE;

const update = () => {
	let doReset = false;
	if (keyp("F1")) {
		PROG = SCRIBBLE;
		doReset = true;
	}
	if (keyp("F2")) {
		PROG = FONT_EDITOR;
		doReset = true;
	}
	if (doReset) {
		reset();
		PROG.BOOT && PROG.BOOT();
	}
	tick(PROG);
	requestAnimationFrame(update);
};

requestAnimationFrame(update);

console.log(MEM, code());
