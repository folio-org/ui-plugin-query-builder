import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';

import { formattedLanguageName } from '@folio/stripes/components';

import { DATA_TYPES } from '../../constants/dataTypes';

export const formatValueByDataType = (value, dataType, intl, additionalParams = {}) => {
  if (value === undefined || value === null) {
    return '';
  }

  // some values may already be formatted and show as this (e.g. deleted records placeholders)
  if (React.isValidElement(value)) {
    return value;
  }

  switch (dataType) {
    case DATA_TYPES.BooleanType:
      // booleans may be returned as true booleans, or strings 'true' or 'false'
      if (typeof value === 'string') {
        return value === 'true' ? (
          <FormattedMessage id="ui-plugin-query-builder.options.true" />
        ) : (
          <FormattedMessage id="ui-plugin-query-builder.options.false" />
        );
      } else {
        return value ? (
          <FormattedMessage id="ui-plugin-query-builder.options.true" />
        ) : (
          <FormattedMessage id="ui-plugin-query-builder.options.false" />
        );
      }

    case DATA_TYPES.DateType:
      // DateType is timezone agnostic; value expected as YYYY-MM-DD. Return as-is (string) so table renders raw/localizable text.
      // If BE ever sends full ISO, fall back to trimming time part.
      if (typeof value === 'string') {
        const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

        if (dateOnlyMatch) {
          return dateOnlyMatch[1];
        }
      }

      return value;

    case DATA_TYPES.DateTimeType:
      return <FormattedDate value={value} />;

    case DATA_TYPES.JsonbArrayType:
    case DATA_TYPES.ArrayType:
      if (additionalParams?.isInstanceLanguages) {
        return value.map((lang) => formattedLanguageName(lang, intl)).join(' | ');
      }

      return value.join(' | ');

    case DATA_TYPES.NumberType:
    case DATA_TYPES.IntegerType:
      return value;

    default:
      return value || '';
  }
};

export const findLabelByValue = (options, value) => {
  // Exceptional case for custom field, that can be identified using that pattern,
  // that comes from JSONB
  if (!/(_custom_field|opt_)/.test(value) || Array.isArray(value)) return value;

  return options?.options.find(option => option.value === value)?.label;
};
