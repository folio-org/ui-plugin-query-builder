/**
 * Upgrades initial values to indirectly reference id columns (e.g. vendor_code instead of vendor_id).
 * FQM used to previously require vendor_id, but this was changed in MODFQMMGR-151 to allow for better expression
 * and to allow for more flexibility in the future.
 */
export default function upgradeInitialValues(initialValues, entityType) {
  if (!initialValues || !entityType) {
    return initialValues;
  }

  const idColumnMapping = {};

  entityType.columns.forEach((column) => {
    if (column.idColumnName) {
      idColumnMapping[column.idColumnName] = column.name;
    }
  });

  const upgradedInitialValues = {};

  Object.keys(initialValues).forEach((key) => {
    const newKey = idColumnMapping[key] || key;

    upgradedInitialValues[newKey] = initialValues[key];
  });

  return upgradedInitialValues;
}
