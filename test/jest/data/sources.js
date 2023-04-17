import { delayedResponse } from './helpers';
import { content } from './content';
import { entityType } from './entityType';

export const testQueryDataSource = () => {
  const testQueryId = 'query-id-1';

  return delayedResponse(300, { content, entityType, testQueryId });
};

export const runQueryDataSource = () => {
  return delayedResponse(300, true);
};
