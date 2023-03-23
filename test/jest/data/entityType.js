export const entityType = {
  'id': '0cb79a4c-f7eb-4941-a104-745224ae0292',
  'name': 'item_details',
  'labelAlias': 'Item',
  'columns': [
    {
      'name': 'id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item Id',
      'visibleByDefault': false,
      'values': null,
    },
    {
      'name': 'item_effective_call_number',
      'dataType': {
        'dataType': 'integerType',
      },
      'labelAlias': 'Effective Call Number',
      'visibleByDefault': false,
      'values': null,
    },
    {
      'name': 'patron_group',
      'dataType': {
        'dataType': 'rangedUUIDType',
      },
      'labelAlias': 'Patron group',
      'visibleByDefault': false,
      'values': [
        { label: 'UC Academic, Indefinite', value: 'Indefinite' },
        { label: 'UC Department, Quarter', value: 'Quarter' },
      ],
    },
    {
      'name': 'Active',
      'dataType': {
        'dataType': 'booleanType',
      },
      'labelAlias': 'Active',
      'visibleByDefault': false,
      'values': [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ],
    },
    {
      'name': 'Status',
      'dataType': {
        'dataType': 'enumType',
      },
      'labelAlias': 'Status',
      'visibleByDefault': false,
      'values': [
        { label: 'Available', value: 'available' },
        { label: 'Checked out', value: 'checked' },
      ],
    },
    {
      'name': 'position',
      'dataType': {
        'dataType': 'integerType',
      },
      'labelAlias': 'Position',
      'visibleByDefault': false,
      'values': null,
    },
    {
      'name': 'expirationDate',
      'dataType': {
        'dataType': 'dateType',
      },
      'labelAlias': 'Expiration date',
      'visibleByDefault': false,
      'values': null,
    },
    {
      'name': 'instanceId',
      'dataType': {
        'dataType': 'openUUIDType',
      },
      'labelAlias': 'Instance UUID',
      'visibleByDefault': false,
      'values': null,
    },
    {
      'name': 'holdingsrecord.electronicAccess.relationship',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'holdingsrecord.electronicAccess.relationship',
      'visibleByDefault': false,
      'values': null,
    },
  ],
  'defaultSort': [
    {
      'columnName': 'item_effective_call_number',
      'direction': 'ASC',
    },
    {
      'columnName': 'item_effective_location_name',
      'direction': 'ASC',
    },
    {
      'columnName': 'instance_title',
      'direction': 'ASC',
    },
    {
      'columnName': 'instance_primary_contributor',
      'direction': 'ASC',
    },
  ],
};
