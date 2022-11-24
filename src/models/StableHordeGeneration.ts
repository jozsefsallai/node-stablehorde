import * as fs from 'fs';
import { GenericModel } from './GenericModel';

/**
 * @api public
 * @class StableHordeGeneration
 * @classdesc A single image generation returned by Stable Horde.
 */
export class StableHordeGeneration implements GenericModel {
  private _image: string;

  /**
   * The name of the worker that generated this image.
   */
  public workerName: string;

  constructor(image: string, workerName: string) {
    this._image = image;
    this.workerName = workerName;
  }

  toJSON(): object {
    return {
      img: this._image,
      worker_name: this.workerName,
    };
  }

  static fromJSON(data: any): StableHordeGeneration {
    return new StableHordeGeneration(data['img'], data['worker_name']);
  }

  /**
   * An alias to the StableHordeGeneration#buffer method.
   *
   * @returns {Buffer} A buffer containing the WEBP image data.
   */
  image(): Buffer {
    return this.buffer();
  }

  /**
   * Will return the image as a buffer.
   *
   * @returns {Buffer} A buffer containing the WEBP image data.
   */
  buffer(): Buffer {
    return Buffer.from(this._image, 'base64');
  }

  /**
   * Will return the original base64-encoded image from Stable Horde.
   *
   * @returns {string} A base64-encoded WEBP image.
   */
  base64(): string {
    return this._image;
  }

  /**
   * Saves the image to the specified path asynchronously.
   *
   * @param path The path to save the image to.
   */
  async save(path: string): Promise<void> {
    fs.promises.writeFile(path, this.buffer());
  }

  /**
   * Saves the image to the specified path synchronously.
   *
   * @param path The path to save the image to.
   */
  saveSync(path: string): void {
    fs.writeFileSync(path, this.buffer());
  }

  /**
   * Creates a read stream from the image's buffer.
   *
   * @returns {fs.ReadStream} A read stream that you can pipe to a write stream.
   */
  stream(): fs.ReadStream {
    return fs.createReadStream(this.buffer());
  }
}
