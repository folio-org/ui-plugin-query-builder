import { getColumnsWithProperties } from './selectOptions';
import { isMarcFieldName } from './marcFields';

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

        // MARC fields aren't enumerable columns, so they're absent from allowedKeys — keep them explicitly.
        return allowedKeys.includes(key) || isMarcFieldName(key);
      }),
    };
  }

  return Object.fromEntries(
    entries.filter(([key]) => allowedKeys.includes(key) || isMarcFieldName(key)),
  );
}

/**
 * Normalizes initial values before they are handed to the builder.
 *
 * This used to also rewrite id columns to their label column (e.g. vendor_id -> vendor_code), because FQM once
 * required vendor_id and MODFQMMGR-151 changed it to prefer the label column. That rewrite is gone as of UIPQB-295:
 * since UIPQB-282 stopped hiding columns that are used as another column's `idColumnName`, users can deliberately
 * query a UUID column, and rewriting the key silently swapped their field (and, through the label column's value
 * source, their UUID for a name) on save. Legacy queries are upgraded server-side in mod-lists, and any id column
 * that is not selectable here is dropped by `filterByEntityColumns` before it could have been rewritten anyway,
 * so nothing is lost by leaving the keys alone.
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

  return filterByEntityColumns(withoutVersion, entityType);
}
