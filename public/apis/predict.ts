/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PREDICT_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';
import type { Query } from '../../public/components/data/query_field';

interface Body {
  input_query?: Record<string, string | number | string[] | Query>;
  input_index?: string[];
}

interface Payload {
  query: Query | undefined;
  fields: Record<string, string[]>;
}

export interface PredictResponse {
  status: string;
  prediction_result?: {
    column_metas: Array<{
      name: string;
      column_type: string;
    }>;
    rows: Array<{
      values: Array<{
        column_type: string;
        value: number | string | boolean;
      }>;
    }>;
  };
  message?: string;
}

export class Predict {
  public predict(payload: Payload, algo: string, modelId: string) {
    const { fields, query } = payload;
    const index = Object.keys(fields)[0];
    if (!index) return {};
    const body: Body = {
      input_query: {
        _source: fields[index],
        size: 10000,
      },
      input_index: [index],
    };
    if (query) {
      body.input_query!.query = query;
    }
    return InnerHttpProvider.getHttp().post<PredictResponse>(
      `${PREDICT_API_ENDPOINT}/${algo}/${modelId}`,
      {
        body: JSON.stringify(body),
      }
    );
  }
}
