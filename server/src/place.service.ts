import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createCanvas, Image } from 'canvas';
import { getDefaultHardCodedCanvasB64 } from './helpers';

@Injectable()
export class PlaceService {
  constructor(@InjectConnection() private connection: Connection) {}

  async manipulateCanvas(b: Buffer) {
    const arrayBuffer = b.buffer.slice(
      b.byteOffset,
      b.byteOffset + b.byteLength,
    );

    const getUint32 = (b: ArrayBuffer, offset: number) => {
      const view = new DataView(b);
      return view.getUint32(offset, false);
    };

    const canvas = await this.getCanvas();
    const ctx = canvas.getContext('2d');

    const x = getUint32(arrayBuffer, 0);
    const y = getUint32(arrayBuffer, 4);
    const color = new Uint8Array(arrayBuffer.slice(8));
    ctx.fillStyle = `rgb(${color.toString()})`;
    ctx.fillRect(x, y, 1, 1);
    this.saveBuffer(canvas.toBuffer());
  }

  getDefaultCanvas() {
    return this.getCanvasFromBuffer(
      Buffer.from(getDefaultHardCodedCanvasB64(), 'base64'),
    );
  }

  async getCanvas() {
    const buffer = await this.getBuffer();
    if (!buffer) return this.getDefaultCanvas();
    const canvas = this.getCanvasFromBuffer(buffer);
    if (!canvas) return this.getDefaultCanvas();

    return canvas;
  }

  async getCanvasBuffer() {
    return (await this.getCanvas()).toBuffer();
  }

  getCanvasFromBuffer(b: Buffer) {
    const img = new Image();
    img.src = Buffer.from(b);

    if (img.width === 0) {
      return null;
    }

    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  async saveBuffer(b: Buffer) {
    return this.connection.db
      .collection('canvas')
      .updateOne(
        {},
        { $set: { data: b.toString('base64') } },
        { upsert: true },
      );
  }

  async getBuffer() {
    const arr = await this.connection.db.collection('canvas').findOne({});
    if (!arr || !arr.data) {
      return null;
    }
    return Buffer.from(arr.data, 'base64');
  }
}
