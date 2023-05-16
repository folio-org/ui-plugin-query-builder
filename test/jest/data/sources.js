import { delayedResponse } from './helpers';
import { QUERY_DETAILS_STATUSES } from '../../../src/constants/query';
import { content } from './content';
import { entityType } from './entityType';

export const testQueryDataSource = () => {
  return delayedResponse(300, { queryId: 'query-id-1' });
};

export const cancelQueryDataSource = () => {
  return delayedResponse(300, { canceled: true });
};

export const getParamsSource = () => {
  return delayedResponse(300, []);
};

export const entityTypeDataSource = () => {
  return delayedResponse(300, entityType);
};

export const queryDetailsDataSource = () => {
  return delayedResponse(300, {
    ...content,
    status: QUERY_DETAILS_STATUSES.SUCCESS,
  });
};

export const runQueryDataSource = () => {
  return delayedResponse(300, true);
};
