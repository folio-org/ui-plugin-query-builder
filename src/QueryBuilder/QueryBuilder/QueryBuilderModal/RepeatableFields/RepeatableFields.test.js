import { getMemoizedValues } from './RepeatableFields';

describe('getMemoizedValues', () => {
  it('uses cached options when they exist', () => {
    const currentOptions = [{ value: 'available', label: 'Available' }];
    const getDataOptions = jest.fn();

    expect(getMemoizedValues({
      currentOptions,
      rowField: 'status',
      getDataOptions,
    })).toEqual(currentOptions);

    expect(getDataOptions).not.toHaveBeenCalled();
  });

  it('uses fetched options when cached options are missing', () => {
    const fetchedOptions = [{ value: 'available', label: 'Available' }];
    const getDataOptions = jest.fn(() => fetchedOptions);

    expect(getMemoizedValues({
      currentOptions: undefined,
      rowField: 'status',
      getDataOptions,
    })).toEqual(fetchedOptions);

    expect(getDataOptions).toHaveBeenCalledWith('status');
  });
});
