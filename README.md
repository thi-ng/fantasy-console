# thi.ng/fantasy-console

A TIC-80 inspired browser-based fantasy console originally developed for a
workshop series @ Technical University Augsburg in 2022/23.

Under a larger conceptual framing of permacomputing (in the widest sense), low
resource usage and learnings from older low-powered hardware and the oftentimes
ingenious solutions these limitations fostered, the project aimed to demostrate
to students how to built up a custom personal computing system using familiar
(web) technologies and introduced students to various technical (retro)computing
concepts, incl.

-   Memory layouts/maps
-   Control/device registers (e.g. for I/O)
-   Interrupts (here only HSYNC/VSYNC)
-   Binary & hex data encoding
-   Indexed color modes, color/palette cycling
-   Bitmap fonts

The project also implements a small embedded DSL to interact with the virtual
hardware (main RAM & VRAM), I/O registers (e.g. mouse & time/date) and provide a
basic graphics API to create small graphical tools & experiments written in a
subset of JavaScript.

**The entire console (incl. all examples listed below) is only 33KB (12.9KB gzipped)!**

## Examples

A pre-built version of the fantasy console is available online at:

https://demo.thi.ng/umbrella/fantasy-console/

### Instructions

-   Press `1` - `6` to select/launch/reset any of the examples
-   Press `Space` to download screenshot
-   Apart from the raster bars and lissajous curve all other demos can be
    interacted with via mouse
-   Open the browser console to see the (already transpiled) source code of all
    examples

**See [/src/roms](./src/roms) for source code of all examples...**

### Example #1: Scribble & color cycling

Hold down left mouse button to cycle the colors (the current palette is also
always shown in bottom-left corner). Nice, powerful oldskool effect, which is
actually easier to do with these indexed, non-RGB pixel buffers[1]

### Example #2: Lissajous bobs

The spheres are actually 2x2 tiles of 8x8 pixel sprites with one color slot
chosen as transparency. Drawing 100 spheres here, but could be a lot more...

### Example #3: Raster bars

This oldskool effect is achieved via HSYNC interrupts only, i.e. no lines are
being drawn — for every single pixel row we simply change the color value of the
first palette entry. The text is also only being drawn once, at startup...

### Example #4: Particle system

Simple particle system (2k particles) with the emitter position linked to the
mouse. 6% probability for larger particles.

### Example #5: Random pattern

Classic oldskool generative art, here by defining 4 custom bitmap font
characters and then drawing a single randomly chosen char per frame

### Example #6: Bitmap font editor

Select a character on the RHS to edit in the left box. Left click to set a
pixel, right click to clear it. Press `Delete` to clear the char entirely. The
system supports proportional width fonts and the little red triangle can be
moved horizontally to adjust the width of each char... Clicking on the `Save`
button will download a JSON file of the font's binary data (9 bytes per char:
width + 8 data bytes)

## Running locally

```bash
git clone https://github.com/thi-ng/fantasy-console.git

cd fantasy-console

# download all dependencies (can also use npm)
yarn install

# start dev server & open in browser
yarn start
```

## License

This project is licensed under the MIT License. See LICENSE.txt

&copy; 2022-2024 Karsten Schmidt
