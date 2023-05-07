import { exposeGlobal } from "@thi.ng/expose";
import { code, MEM, compile, reset, tick } from "./machine";
import FONT_EDIT_SRC from "./font-edit.js?raw";

document.body.appendChild(reset());

// u32.set(RAYLEIGH, PALETTE >> 2);

// for (let x = 0; x < MEM.WIDTH / 2; x++) {
// 	POKE(MEM.PIXELS + x, (x & 0xf) * 0x11);
// 	SETPIXEL(x * 2, 2, x & 0xf);
// 	SETPIXEL(x * 2 + 1, 3, x & 0xf);
// }

// for (let i = 0; i < 1000; i++)
// 	CIRCLE(RANDOM(WIDTH), RANDOM(HEIGHT), 8, i & 15, 1);

// TEXT(
// 	"!\"#$%&'()*+,-./\n0123456789\n:;<=>?@\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n[\\]^_`{|}",
// 	4,
// 	4,
// 	12
// );

// hsync(y) {
//  POKE(PALETTE_BASE,y)
//  POKE(PALETTE_BASE+1,y/2)
//  POKE(PALETTE_BASE+2,y/8)
// },

const DEMO1 = compile(
	`function tick() {
 if (peek(MOUSE_BUTTONS)&1 && !(peek(FRAME)%4)) {
  cycle(PALETTE+4,PALETTE+PALETTE_SIZE-4,-4)
 }
 if (peek(MOUSE_BUTTONS)&2) scrollv(1)
 const x=peek(MOUSEX)
 const y=peek(MOUSEY)
 const r=fitc(dist(x,y,peek(PMOUSEX),peek(PMOUSEY)),0,10,2,15)
 const col=((peek(FRAME)/4)%14)+1
 circle(x,y,r,col,1)
 rect(0,0,WIDTH,7,15,1)
 text(\`\${peek(HOUR)}:\${peek(MINUTE)}:\${peek(SECOND)}\`,0,0,4,0)
 text(\`X: \${x} Y: \${y}\`,50,0,12,0,6)
 if (peek(KEY)==32) text(code(),1,8,12,0,7)
}`
);

const FONT_EDITOR = compile(FONT_EDIT_SRC);

const update = () => {
	tick(FONT_EDITOR);
	requestAnimationFrame(update);
};

requestAnimationFrame(update);

console.log(MEM, code());
