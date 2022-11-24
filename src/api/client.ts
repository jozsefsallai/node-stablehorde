import axios from 'axios';

import { StableHordeQueuedRequest } from '../models/StableHordeQueuedRequest';
import { StableHordeRequestStatus } from '../models/StableHordeRequestStatus';
import { StableHordeGenerations } from '../models/StableHordeGenerations';
import { StableHordeAsyncRequestHandler } from './asyncRequestHandler';

/**
 * Contains the options for a Stable Horde client.
 *
 * @typedef {Object} StableHordeClientOptions
 * @property {string?} [baseUrl] The base URL of the Stable Horde API to use.
 * @property {string} [apiKey] The API key to use for requests.
 */
export interface StableHordeClientOptions {
  baseUrl?: string;
  apiKey: string;
}

/**
 * Request parameters for a single Stable Diffusion image generation.
 *
 * @typedef {Object} StableHordeRequestParameters
 * @property {number} [n] The number of images to generate. Defaults to 1.
 * @property {number} [width] The width of the images to generate. Defaults to
 *                            512.
 * @property {number} [height] The height of the images to generate. Defaults to
 *                             512.
 * @property {number} [cfgScale] The config scale (C-value) of the generated
 *                               images. Defaults to 7.5.
 * @property {number} [steps] The number of steps. Defaults to 24.
 */
export interface StableHordeRequestParameters {
  n: number;
  width: number;
  height: number;
  cfgScale: number;
  steps: number;
}

const DEFAULT_PARAMS: StableHordeRequestParameters = {
  n: 1,
  width: 512,
  height: 512,
  cfgScale: 7.5,
  steps: 24,
};

/**
 * @api public
 * @class Client
 * @classdesc An API client for Stable Horde.
 */
export class Client {
  private static ASYNC_GENERATE_PATH = '/api/v2/generate/async';
  private static ASYNC_REQUEST_CHECK_PATH = '/api/v2/generate/check/:requestID';
  private static ASYNC_REQUEST_STATUS_PATH =
    '/api/v2/generate/status/:requestID';

  private baseUrl: string;
  private apiKey: string;

  /**
   * @constructor
   * @param {StableHordeClientOptions} [options] The options for the client.
   */
  constructor({ baseUrl, apiKey }: StableHordeClientOptions) {
    this.baseUrl = baseUrl ?? 'https://stablehorde.net';
    this.apiKey = apiKey;
  }

  /**
   * Creates an asynchronous request handler for a single request. This request
   * handler will emit events as the request progresses, given a specific
   * polling interval.
   *
   * @param {number} [pollingInterval] The polling interval in milliseconds.
   *                                   Defaults to 5000.
   * @returns {StableHordeAsyncRequestHandler} The request handler.
   */
  newRequestHandler(
    pollingInterval: number = 5000,
  ): StableHordeAsyncRequestHandler {
    return new StableHordeAsyncRequestHandler(this, pollingInterval);
  }

  /**
   * Enqueues an image generation request.
   *
   * @param {string} [prompt] The prompt to use for the generation.
   * @param {StableHordeRequestParameters} [params] The parameters for the
   *                                                generation.
   * @returns {Promise<StableHordeQueuedRequest>} The queued request.
   */
  async generateAsync(
    prompt: string,
    params: StableHordeRequestParameters = DEFAULT_PARAMS,
  ): Promise<StableHordeQueuedRequest> {
    const url = this.makeAsyncGenerateUrl();
    const response = await axios.post(
      url,
      {
        prompt,
        params: this.normalizeParameters(params),
      },
      {
        headers: {
          apikey: this.apiKey,
        },
      },
    );

    if (response.status !== 202) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    return StableHordeQueuedRequest.fromJSON(response.data);
  }

  /**
   * Checks the status of a given request.
   *
   * @param {StableHordeQueuedRequest} [request] The request to check.
   * @returns {Promise<StableHordeRequestStatus>} Request status object.
   */
  async check(
    request: StableHordeQueuedRequest,
  ): Promise<StableHordeRequestStatus> {
    const url = this.makeAsyncRequestCheckUrl(request.id);
    const response = await axios.get(url);
    return StableHordeRequestStatus.fromJSON(response.data);
  }

  /**
   * Returns the generations of a given request. You may only send this request
   * twice every minute.
   *
   * @param request
   * @returns
   */
  async generations(
    request: StableHordeQueuedRequest,
  ): Promise<StableHordeGenerations> {
    const url = this.makeAsyncRequestStatusUrl(request.id);
    const response = await axios.get(url);
    return StableHordeGenerations.fromJSON(response.data);
  }

  private normalizeParameters(params: StableHordeRequestParameters): object {
    const finalParams = {
      ...DEFAULT_PARAMS,
      ...params,
    };

    return {
      n: finalParams.n,
      width: finalParams.width,
      height: finalParams.height,
      cfg_scale: finalParams.cfgScale,
      steps: finalParams.steps,
    };
  }

  private makeUrl(url: string) {
    return this.baseUrl + url;
  }

  private makeAsyncGenerateUrl() {
    return this.makeUrl(Client.ASYNC_GENERATE_PATH);
  }

  private makeAsyncRequestCheckUrl(requestID: string) {
    return this.makeUrl(
      Client.ASYNC_REQUEST_CHECK_PATH.replace(':requestID', requestID),
    );
  }

  private makeAsyncRequestStatusUrl(requestID: string) {
    return this.makeUrl(
      Client.ASYNC_REQUEST_STATUS_PATH.replace(':requestID', requestID),
    );
  }
}
