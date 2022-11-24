import { GenericModel } from './GenericModel';
import { StableHordeGeneration } from './StableHordeGeneration';

/**
 * @api public
 * @class StableHordeGenerations
 * @classdesc The list of generations returned by Stable Horde, as well as the
 *            workers that generated them.
 */
export class StableHordeGenerations implements GenericModel {
  /**
   * A list of generation objects.
   */
  public generations: StableHordeGeneration[];

  constructor(generations: StableHordeGeneration[]) {
    this.generations = generations;
  }

  toJSON(): object {
    return {
      generations: this.generations.map((g) => g.toJSON()),
    };
  }

  static fromJSON(data: any): StableHordeGenerations {
    return new StableHordeGenerations(
      data['generations'].map((g: any) => StableHordeGeneration.fromJSON(g)),
    );
  }

  /**
   * The generated images as WEBP binary buffers.
   *
   * @returns {Buffer[]} An array of buffers containing the WEBP image data.
   */
  buffers(): Buffer[] {
    return this.generations.map((g) => g.buffer());
  }

  /**
   * The generated images as base64-encoded strings.
   *
   * @returns {string[]} An array of base64-encoded WEBP images.
   */
  base64(): string[] {
    return this.generations.map((g) => g.base64());
  }
}
