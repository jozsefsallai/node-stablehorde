import { GenericModel } from './GenericModel';

/**
 * @api public
 * @class StableHordeQueuedRequest
 * @classdesc A single queued image generation request.
 */
export class StableHordeQueuedRequest implements GenericModel {
  /**
   * The ID of the request.
   */
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  toJSON(): object {
    return {
      id: this.id,
    };
  }

  static fromJSON(data: any): StableHordeQueuedRequest {
    return new StableHordeQueuedRequest(data['id']);
  }
}
