import { StableHordeGenerations } from '../models/StableHordeGenerations';
import { StableHordeQueuedRequest } from '../models/StableHordeQueuedRequest';
import { StableHordeRequestStatus } from '../models/StableHordeRequestStatus';
import { Client, StableHordeRequestParameters } from './client';

export class StableHordeAsyncRequestHandler {
  private client: Client;
  private pollingInterval: number;

  private handlers: Map<string, (data: any) => void>;

  constructor(client: Client, pollingInterval: number = 5000) {
    this.client = client;
    this.handlers = new Map();
    this.pollingInterval = pollingInterval;
  }

  /**
   * Registers an event handler for the `created` event. This event will run
   * when the request is created on Stable Horde's API.
   *
   * @param {'created'} [event] Created event.
   * @param {Function} [handler] The callback. Receives a {StableHordeQueuedRequest}
   * as its only argument.
   */
  public on(
    event: 'created',
    handler: (data: StableHordeQueuedRequest) => void,
  ): void;

  /**
   * Registers an event handler for the `statusPolled` event. This event will
   * run every time the status of the request is polled.
   *
   * @param {'statusPolled'} [event] Status polled event.
   * @param {Function} [handler] The callback. Receives a {StableHordeRequestStatus}
   * as its only argument.
   */
  public on(
    event: 'statusPolled',
    handler: (data: StableHordeRequestStatus) => void,
  ): void;

  /**
   * Registers an event handler for the `finished` event. This event will run
   * when the image generation has finished.
   *
   * @param {'finished'} [event] Finished event.
   * @param {Function} [handler] The callback. Receives a {StableHordeGenerations}
   * object as its only argument.
   */
  public on(
    event: 'finished',
    handler: (data: StableHordeGenerations) => void,
  ): void;

  /**
   * Registers an event for the `error` event. This event will run when an
   * error occurs.
   *
   * @param {'error'} [event] Error event.
   * @param {Function} [handler] The callback. Receives an error as its only
   * argument.
   */
  public on(event: 'error', handler: (data: any) => void): void;

  /**
   * Registers an event handler.
   *
   * @param {string} [event] The event to register.
   * @param {Function} [handler] The callback.
   */
  public on(event: string, handler: (data: any) => void): void {
    this.handlers.set(event, handler);
  }

  /**
   * Unregisters an event handler.
   *
   * @param {string} [event] The event to unregister.
   */
  public off(event: string): void {
    this.handlers.delete(event);
  }

  private emit(event: string, data: any): void {
    const handler = this.handlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  /**
   * Creates a new image generation request emitting the `create` event. Then it
   * will poll the status of the request until it is done, emitting a `statusPolled`
   * event on every iteration. When the request is done, it will emit a `finished`
   * event.
   *
   * @param {string} [prompt] The prompt to use for the image generation.
   * @param {StableHordeRequestParameters} [params] The request parameters.
   * @returns {Promise<StableHorderAsyncRequestHandler>} A reference to itself.
   */
  public async generate(
    prompt: string,
    params: StableHordeRequestParameters,
  ): Promise<StableHordeAsyncRequestHandler> {
    try {
      const request = await this.client.generateAsync(prompt, params);
      this.emit('created', request);
      this.poll(request);
    } catch (err) {
      this.emit('error', err);
    }

    return this;
  }

  private async poll(request: StableHordeQueuedRequest): Promise<void> {
    try {
      const status = await this.client.check(request);
      this.emit('statusPolled', status);

      if (status.done) {
        const generations = await this.client.generations(request);
        this.emit('finished', generations);
      } else {
        setTimeout(() => this.poll(request), this.pollingInterval);
      }
    } catch (err) {
      this.emit('error', err);
    }
  }
}
