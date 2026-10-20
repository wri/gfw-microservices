/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { AbstractHandler, ChainType } from './types';

export class PreviewStep extends AbstractHandler<ChainType> {
  async handle(request: ChainType): Promise<ChainType> {
    if (request?.geojson?.features) {
      request.geojson.features = request.geojson.features.slice(0, 10);
    }
    return request;
  }
}
