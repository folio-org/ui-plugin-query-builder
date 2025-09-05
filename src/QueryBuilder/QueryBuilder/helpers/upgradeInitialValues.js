import { getColumnsWithProperties } from './selectOptions';

/**
 * Filters the single array property in an `initialValues` object so that
 * only entries whose keys match the given entity type column names are kept.
 *
 * This is needed for scenarios where values used to build a custom query
 * during creation have since been removed from the available entity types.
 * When editing an existing query, those obsolete values should be filtered out
 * because they no longer exist in `entityTypes.columns`.
 * there are 2 types of initial values:
 * {$end: [{...}, {...}]} - when there are multiple rows selected
 * {field: {...}} - when there is only one row selected
 */
export function filterByEntityColumns(initialValues, entityTypes) {
  const entries = Object.entries(initialValues);
  const allowedKeys = getColumnsWithProperties(entityTypes?.columns).map(type => type.name) || [];
  const arrayEntry = entries
    .find(([, value]) => Array.isArray(value));

  if (arrayEntry) {
    const [arrayProp] = arrayEntry;

    return {
      ...initialValues,
      [arrayProp]: initialValues[arrayProp].filter(item => {
        const key = Object.keys(item)[0];

        return allowedKeys.includes(key);
      }),
    };
  }

  return Object.fromEntries(
    entries.filter(([key]) => allowedKeys.includes(key)),
  );
}

/**
 * Upgrades initial values to indirectly reference id columns (e.g. vendor_code instead of vendor_id).
 * FQM used to previously require vendor_id, but this was changed in MODFQMMGR-151 to allow for better expression
 * and to allow for more flexibility in the future.
 *
 * As part of UIPQB-125, we're stripping out the _version key from the initial values, too. We will assume that any
 * queries edited/created here are the latest version, as we only have the latest version of entity types available.
 * In the future, it might be neat to send a request to /fqm/migrate if we see initialValues are out of date, but that's
 * outside the scope of UIPQB-125 as we already upgrade queries in the background in mod-lists.
 *
 * Returns undefined if there is no initial value (new query).
 */
export default function upgradeInitialValues(initialValues, entityType) {
  if (!initialValues) {
    return undefined;
  }

  const withoutVersion = { ...initialValues };

  delete withoutVersion._version;

  if (Object.keys(withoutVersion).length === 0) {
    // if the query is {}, treat it as a new query
    // (all add buttons are displayed on existing rows except for the "new list" state, so if we do
    // not simulate this state, the user will be unable to add anything)
    return undefined;
  }

  if (!entityType) {
    return withoutVersion;
  }

  const filteredInitialValues = filterByEntityColumns(withoutVersion, entityType);

  const idColumnMapping = {};

  getColumnsWithProperties(entityType.columns).forEach((column) => {
    if (column.idColumnName) {
      idColumnMapping[column.idColumnName] = column.name;
    }
  });

  const upgradedInitialValues = {};

  Object.keys(filteredInitialValues).forEach((key) => {
    const newKey = idColumnMapping[key] || key;

    upgradedInitialValues[newKey] = filteredInitialValues[key];
  });

  return upgradedInitialValues;
}
