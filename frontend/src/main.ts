import Socket from 'socket.io-client';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constant";
import Whiteboard, { Tool } from "./whiteboard";

const canvas = document.createElement('canvas'); 
const pencil = document.getElementById('pencil');
const rectangle = document.getElementById('rectangle');


const room_id = location.search.split('=')[1];
 
const io = Socket('http://localhost:3000');

io.emit('join_room', room_id);

// adding the canvas to the body of the document
document.body.append(canvas);
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// taking out the context from the canvas
const ctx = canvas.getContext('2d');

const whiteboard = new Whiteboard(canvas);

io.on('state_change', (state) => {
  whiteboard.pencil.paths = state.pencil;
  whiteboard.rectangle.rects = state.rectangle;
});

pencil?.addEventListener('click', () => {
  whiteboard.setTool(Tool.PENCIL);
});
rectangle?.addEventListener('click', () => {
  whiteboard.setTool(Tool.RECTANGLE);
});

whiteboard.addEventListener('state_change', () => {
  const state = {
    pencil: whiteboard.pencil.paths,
    rectangle: whiteboard.rectangle.rects
  }
  io.emit('state_change', {
    state,
    room_id: room_id,
  });
});

// animation stuff like drag drop  tec.
const animationLoop = () => {
  // requestAnimationFrame is the recursive function that will call the animation loop so we can make changes to the canvas
  // DRAW AND THEN UPDATE
  if(ctx){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // every time we draw we clear the canvas so no previous drawings are shown
    whiteboard.draw(ctx);
    whiteboard.update();
  }
  requestAnimationFrame(animationLoop);
}

animationLoop();

