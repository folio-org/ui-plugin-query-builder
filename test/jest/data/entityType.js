export const entityType = {
  'id': '4e09d89a-44ed-418e-a9cc-820dfb27bf3a',
  'name': 'loan_details',
  'labelAlias': 'Loan',
  'columns': [
    {
      'name': 'user_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User ID',
      'visibleByDefault': false,
    },
    {
      'name': 'user_first_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User first name',
      'visibleByDefault': true,
    },
    {
      'name': 'user_last_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User last name',
      'visibleByDefault': true,
    },
    {
      'name': 'user_full_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User full name',
      'visibleByDefault': true,
    },
    {
      'name': 'user_active',
      'dataType': {
        'dataType': 'booleanType',
      },
      'labelAlias': 'User active',
      'visibleByDefault': true,
      'values': [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
    },
    {
      'name': 'user_barcode',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User barcode',
      'visibleByDefault': false,
    },
    {
      'name': 'user_expiration_date',
      'dataType': {
        'dataType': 'dateType',
      },
      'labelAlias': 'User expiration date',
      'visibleByDefault': true,
    },
    {
      'name': 'user_patron_group_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User patron group ID',
      'visibleByDefault': false,
    },
    {
      'name': 'user_patron_group',
      'dataType': {
        'dataType': 'rangedUUIDType',
      },
      'labelAlias': 'User patron group',
      'visibleByDefault': true,
      'values': [
        { label: 'UC Academic, Indefinite', value: 'Indefinite' },
        { label: 'UC Department, Quarter', value: 'Quarter' },
      ],
    },
    {
      'name': 'status',
      'dataType': {
        'dataType': 'enumType',
      },
      'labelAlias': 'Status',
      'visibleByDefault': true,
      'values': [
        { label: 'Available', value: 'available' },
        { label: 'Checked out', value: 'checked' },
      ],
    },
    {
      'name': 'user_customfields',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User custom fields',
      'visibleByDefault': true,
    },
    {
      'name': 'id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan ID',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_status',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan status',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_checkout_date',
      'dataType': {
        'dataType': 'dateType',
      },
      'labelAlias': 'Loan checkout date',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_due_date',
      'dataType': {
        'dataType': 'dateType',
      },
      'labelAlias': 'Loan due date',
      'visibleByDefault': true,
    },
    {
      'name': 'loan_return_date',
      'dataType': {
        'dataType': 'dateType',
      },
      'labelAlias': 'Loan return date',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_policy_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan policy name',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_checkout_servicepoint_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan checkout service point ID',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_checkout_servicepoint_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan checkout service point name',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_checkin_servicepoint_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan checkin service point ID',
      'visibleByDefault': false,
    },
    {
      'name': 'loan_checkin_servicepoint_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Loan checkin service point name',
      'visibleByDefault': false,
    },
    {
      'name': 'item_holdingsrecord_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item holdings record ID',
      'visibleByDefault': false,
    },
    {
      'name': 'instance_id',
      'dataType': {
        'dataType': 'openUUIDType',
      },
      'labelAlias': 'Instance ID',
      'visibleByDefault': true,
      'values': [
        { label: 'InstanceId-1', value: 'instanceId-1' },
        { label: 'InstanceId-2', value: 'instanceId-2' },
      ],
    },
    {
      'name': 'instance_title',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Instance title',
      'visibleByDefault': true,
    },
    {
      'name': 'instance_primary_contributor',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Instance primary contributor',
      'visibleByDefault': false,
    },
    {
      'name': 'item_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item ID',
      'visibleByDefault': false,
    },
    {
      'name': 'item_barcode',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item barcode',
      'visibleByDefault': false,
    },
    {
      'name': 'item_call_number',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item call number',
      'visibleByDefault': false,
    },
    {
      'name': 'item_material_type_id',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item material type ID',
      'visibleByDefault': false,
    },
    {
      'name': 'languages',
      'dataType': {
        'dataType': 'arrayType',
      },
      'labelAlias': 'Languages',
      'visibleByDefault': true,
      'values': [
        { label: 'English', value: 'eng' },
        { label: 'French', value: 'fra' },
      ],
    },
    {
      'name': 'position',
      'dataType': {
        'dataType': 'integerType',
      },
      'labelAlias': 'Position',
      'visibleByDefault': true,
    },
    {
      'name': 'item_material_type',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Item material type',
      'visibleByDefault': false,
      'idColumnName': 'item_material_type_id',
      'source': {
        'entityTypeId': '917ea5c8-cafe-4fa6-a942-e2388a88c6f6',
        'columnName': 'material_type_name',
      },
    },
  ],
  'defaultSort': [
    {
      'columnName': 'user_full_name',
      'direction': 'ASC',
    },
    {
      'columnName': 'loan_due_date',
      'direction': 'ASC',
    },
  ],
};
