import { GLWindow } from "./glwindow";

export class CanvasService {
  cvs: HTMLCanvasElement;
  glWindow: GLWindow;

  constructor(cvs: HTMLCanvasElement) {
    this.cvs = cvs;
    this.glWindow = new GLWindow(this.cvs);
  }

  getCanvas() {
    return this.cvs;
  }

  ok() {
    return this.glWindow.ok();
  }

  setTexture(img: HTMLImageElement) {
    return this.glWindow.setTexture(img);
  }

  setZoom(z: number) {
    return this.glWindow.setZoom(z);
  }

  getZoom() {
    return this.glWindow.getZoom();
  }

  updateViewScale() {
    return this.glWindow.updateViewScale();
  }

  getColor(pos: { x: number; y: number }) {
    return this.glWindow.getColor(pos);
  }

  setPixelColor(x: number, y: number, color: Uint8Array) {
    return this.glWindow.setPixelColor(x, y, color);
  }

  click(pos: { x: number; y: number }) {
    return this.glWindow.click(pos);
  }

  move(x: number, y: number) {
    return this.glWindow.move(x, y);
  }

  draw() {
    return this.glWindow.draw();
  }
}
