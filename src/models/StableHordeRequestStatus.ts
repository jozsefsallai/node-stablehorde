import { GenericModel } from './GenericModel';

/**
 * @api public
 * @class StableHordeRequestStatus
 * @classdesc Status information about an image generation request.
 */
export class StableHordeRequestStatus implements GenericModel {
  /**
   * Whether or not the request is done.
   */
  public done: boolean;

  /**
   * The number of requests that are waiting to be processed.
   */
  public waiting: number;

  /**
   * The number of requests that are currently being processed.
   */
  public processing: number;

  /**
   * The number of requests that have finished processing.
   */
  public finished: number;

  /**
   * The position of the request in the queue.
   */
  public queuePosition: number;

  /**
   * The estimated time in seconds until the request is done.
   */
  public waitTime: number;

  constructor(
    done: boolean,
    waiting: number,
    processing: number,
    finished: number,
    queuePosition: number,
    waitTime: number,
  ) {
    this.done = done;
    this.waiting = waiting;
    this.processing = processing;
    this.finished = finished;
    this.queuePosition = queuePosition;
    this.waitTime = waitTime;
  }

  toJSON(): object {
    return {
      done: this.done,
      waiting: this.waiting,
      processing: this.processing,
      finished: this.finished,
      queue_position: this.queuePosition,
      wait_time: this.waitTime,
    };
  }

  static fromJSON(data: any): StableHordeRequestStatus {
    return new StableHordeRequestStatus(
      data['done'],
      data['waiting'],
      data['processing'],
      data['finished'],
      data['queue_position'],
      data['wait_time'],
    );
  }
}
