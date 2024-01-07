import Pencil from './Pencil';
import Rectangle from './rectangle';

// interface for the position of the mouse
export interface Pos {
  x: number;
  y: number;
}

// different types of tools
export enum Tool {
  PENCIL,
  RECTANGLE,
  TEXT,
  NO_TOOL,
}

// EventTarget is used to emit events so that we can share that with the socket
class Whiteboard extends EventTarget {
  activeTool: Tool = Tool.RECTANGLE;
  mousePos: Pos = { x: 0, y: 0 };
  // initialize pencil and rectangle
  pencil = new Pencil();
  rectangle = new Rectangle();


  constructor(canvas: HTMLCanvasElement) {
    super();
    let mouseDown = false;

    canvas.onmousedown = (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.pencil.updateMouseMos(this.mousePos);
      this.pencil.paths.push([]);
      this.rectangle.currentRect = {
        pos: this.mousePos,
        width: 0,
        height: 0,
      };
      mouseDown = true;

      setInterval(() => {
        this.dispatchEvent(new Event('state_change'));
      }, 1000);
    };

    canvas.onmouseup = () => {
      mouseDown = false;
      this.rectangle.rects.push(this.rectangle.currentRect!);
      this.rectangle.currentRect = undefined;
    };

    document.addEventListener('mousemove', (e) => {
      if (mouseDown) {
        this.dispatchEvent(new Event('state_change'));
        const x = e.clientX;
        const y = e.clientY;
        this.mousePos = { x, y };
        this.pencil.updateMouseMos(this.mousePos);
        this.rectangle.updateMousePosition(this.mousePos);
      }
    });
  }

  updateState(state: any) {
    this.pencil.paths = state.pencil;
    this.rectangle.rects = state.rectangle;
  }

  // function for setting the tool
  setTool(tool: Tool) {
    this.activeTool = tool;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.pencil.draw(ctx);
    this.rectangle.draw(ctx);
  }
  update() {
    if (this.activeTool === Tool.PENCIL) {
      this.pencil.update();
    }
    if (this.activeTool === Tool.RECTANGLE) {
      this.rectangle.update();
    }
  }
}

export default Whiteboard;