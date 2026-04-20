import { getMemoizedValues } from './RepeatableFields';

describe('getMemoizedValues', () => {
  it('uses fetched options for language fields even when cached options exist', () => {
    const currentOptions = [{ value: 'ger', label: 'German' }];
    const fetchedOptions = [{ value: 'ger', label: 'German [ger]' }];
    const getDataOptions = jest.fn(() => fetchedOptions);

    expect(getMemoizedValues({
      currentOptions,
      isLanguageField: true,
      rowField: 'instance.languages',
      getDataOptions,
    })).toEqual(fetchedOptions);

    expect(getDataOptions).toHaveBeenCalledWith('instance.languages', false, undefined, [], true);
  });

  it('uses fetched options when cached options are missing', () => {
    const fetchedOptions = [{ value: 'available', label: 'Available' }];
    const getDataOptions = jest.fn(() => fetchedOptions);

    expect(getMemoizedValues({
      currentOptions: undefined,
      isLanguageField: false,
      rowField: 'status',
      getDataOptions,
    })).toEqual(fetchedOptions);

    expect(getDataOptions).toHaveBeenCalledWith('status', false, undefined, [], false);
  });
});
