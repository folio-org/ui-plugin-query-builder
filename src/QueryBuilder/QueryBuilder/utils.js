import { operatorsMap } from '../constants';

export const getOperatorsSet = (dataType) => {
  return operatorsMap[dataType];
};

export const parseDataOptions = (list) => {
  return list?.map(item => ({
    label: item.labelAlias || item,
    value: item.name || item,
  }));
};