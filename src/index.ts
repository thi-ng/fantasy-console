import { MEM, compile, keyp, reset, saveFrame, tick, tile1 } from "./machine";
import BOBS_SRC from "./roms/bobs.js?raw";
import FONT_EDIT_SRC from "./roms/font-edit.js?raw";
import PARTICLES_SRC from "./roms/particles.js?raw";
import PATTERN_SRC from "./roms/pattern.js?raw";
import RASTER_BARS_SRC from "./roms/raster-bars.js?raw";
import SCRIBBLE_SRC from "./roms/scribble.js?raw";

document.body.appendChild(reset());

const BOBS = compile(BOBS_SRC);
const FONT_EDITOR = compile(FONT_EDIT_SRC);
const PARTICLES = compile(PARTICLES_SRC);
const PATTERN = compile(PATTERN_SRC);
const RASTER_BARS = compile(RASTER_BARS_SRC);
const SCRIBBLE = compile(SCRIBBLE_SRC);

const MENU = {
	Digit1: SCRIBBLE,
	Digit2: BOBS,
	Digit3: RASTER_BARS,
	Digit4: PARTICLES,
	Digit5: PATTERN,
	Digit6: FONT_EDITOR,
};

let PROG = SCRIBBLE;
PROG.BOOT?.();

const update = () => {
	for (let key in MENU) {
		if (keyp(key)) {
			PROG = MENU[<keyof typeof MENU>key];
			reset();
			PROG.BOOT?.();
			if (!PROG.POST_TICK) {
				PROG.POST_TICK = () => tile1(1, 0, MEM.HEIGHT - 8);
			}
			break;
		}
	}
	if (keyp("Space")) {
		saveFrame(`fconsole-${Date.now()}`);
	}
	tick(PROG);
	requestAnimationFrame(update);
};

requestAnimationFrame(update);

// console.log(MEM, code());
