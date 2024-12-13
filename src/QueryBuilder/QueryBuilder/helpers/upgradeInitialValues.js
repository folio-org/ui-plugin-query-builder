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
    return initialValues;
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

  const idColumnMapping = {};

  entityType.columns.forEach((column) => {
    if (column.idColumnName) {
      idColumnMapping[column.idColumnName] = column.name;
    }
  });

  const upgradedInitialValues = {};

  Object.keys(withoutVersion).forEach((key) => {
    const newKey = idColumnMapping[key] || key;

    upgradedInitialValues[newKey] = withoutVersion[key];
  });

  return upgradedInitialValues;
}
