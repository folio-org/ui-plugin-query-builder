import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Badge: jest.fn((props) => (
    <span>
      <span>{props.children}</span>
    </span>
  )),
  Button: jest.fn(({ children }) => (
    <button type="button">
      <span>
        {children}
      </span>
    </button>
  )),
  Col: jest.fn(({ children }) => <div className="col">{children}</div>),
  Datepicker: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>
      {children}
      <input type="text" />
    </div>
  )),
  Headline: jest.fn(({ children }) => <div>{children}</div>),
  Icon: jest.fn((props) => (props && props.children ? props.children :
  <span />)),
  IconButton: jest.fn(({
    buttonProps,
    // eslint-disable-next-line no-unused-vars
    iconClassName,
    ...rest
  }) => (
    <button type="button" {...buttonProps}>
      <span {...rest} />
    </button>
  )),
  Label: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  // oy, dismissible. we need to pull it out of props so it doesn't
  // get applied to the div as an attribute, which must have a string-value,
  // which will shame you in the console:
  //
  //     Warning: Received `true` for a non-boolean attribute `dismissible`.
  //     If you want to write it to the DOM, pass a string instead: dismissible="true" or dismissible={value.toString()}.
  //         in div (created by mockConstructor)
  //
  // is there a better way to throw it away? If we don't destructure and
  // instead access props.label and props.children, then we get a test
  // failure that the modal isn't visible. oy, dismissible.
  Modal: jest.fn(({
    children,
    label,
    dismissible,
    closeOnBackgroundClick,
    ...rest
  }) => {
    return (
      <div
        data-test={dismissible ? '' : ''}
        onClick={closeOnBackgroundClick ? jest.fn() : undefined}
        {...rest}
      >
        <h1>{label}</h1>
        {children}
      </div>
    );
  }),
  ModalFooter: jest.fn((props) => (
    <div>{props.children}</div>
  )),
  MultiSelection: jest.fn(({ children, dataOptions }) => (
    <div>
      <select multiple>
        {dataOptions.forEach((option, i) => (
          <option
            value={option.value}
            key={option.id || `option-${i}`}
          >
            {option.label}
          </option>
        ))}
      </select>
      {children}
    </div>
  )),
  NavList: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  NavListItem: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  NavListSection: jest.fn(({ children, className, ...rest }) => (
    <div className={className} {...rest}>{children}</div>
  )),
  Pane: jest.fn(({
    children,
    className,
    defaultWidth,
    paneTitle,
    paneSub,
    firstMenu,
    lastMenu,
    fluidContentWidth,
    dismissible,
    ...rest
  }) => {
    return (
      <div
        className={className}
        {...rest}
        style={!fluidContentWidth ? { width: '960px' } : { width: defaultWidth }}
      >
        <div>
          {dismissible &&
            <button data-test-pane-header-dismiss-button="true" type="button" />}

          {firstMenu ?? null}
          {paneTitle}
          {lastMenu ?? null}
          {paneSub}
        </div>
        {children}
      </div>
    );
  }),
  Paneset: jest.fn(({ children, defaultWidth, isRoot, ...rest }) => {
    return (
      <div {...rest} style={{ width: defaultWidth }}>
        {children}
        {isRoot && <div className="container" />}
      </div>
    );
  }),
  PaneFooter: jest.fn(({ ref, children, ...rest }) => (
    <div ref={ref} {...rest}>{children}</div>
  )),
  PaneHeader: jest.fn(({ paneTitle, firstMenu, lastMenu }) => (
    <div>
      {firstMenu ?? null}
      {paneTitle}
      {lastMenu ?? null}
    </div>
  )),
  PaneBackLink: jest.fn(() => <span />),
  PaneMenu: jest.fn((props) => <div>{props.children}</div>),
  RadioButton: jest.fn(({ label, name, ...rest }) => (
    <div>
      <label htmlFor="male">{label}</label>
      <input
        type="radio"
        name={name}
        {...rest}
      />
    </div>
  )),
  RadioButtonGroup: jest.fn(({ label, children, ...rest }) => (
    <fieldset {...rest}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  )),
  Row: jest.fn(({ children }) => <div className="row">{children}</div>),
  Select: jest.fn(({ children, dataOptions }) => (
    <div>
      <select>
        {dataOptions.forEach((option, i) => (
          <option
            value={option.value}
            key={option.id || `option-${i}`}
          >
            {option.label}
          </option>))}
      </select>
      {children}
    </div>
  )),
  Loading: jest.fn(() => <div>Loading</div>),
  LoadingPane: jest.fn(() => <div>LoadingPane</div>),
  MultiColumnList: jest.fn((props) => (
    <div data-testid={props['data-testid']} />
  )),
  Layer: jest.fn(({ children, isOpen, contentLabel, ...rest }) => (
    <div aria-label={contentLabel} {...rest}>{isOpen ? children : ''}</div>
  )),
  Accordion: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  AccordionSet: jest.fn(({ children, ...rest }) => (
    <span {...rest}>{children}</span>
  )),
  KeyValue: jest.fn(({ label, children, value }) => (
    <>
      <span>{label}</span>
      <span>{value || children}</span>
    </>
  )),
  MetaSection: jest.fn(({
    children,
    contentId,
    createdDate,
    lastUpdatedDate,
    createdBy,
    lastUpdatedBy,
    ...rest
  }) => (
    <div {...rest}>
      <button type="button" aria-controls={contentId}>
        <div>
          {createdDate} {createdBy}
          {lastUpdatedDate} {lastUpdatedBy}
          {children}
        </div>
      </button>
    </div>
  )),
  Dropdown: jest.fn(({
    children,
    buttonStyle,
    bottomMargin0,
    ...rest
  }) => (
    <div {...rest}>
      <button
        type="button"
        style={{
          backgroundColor: buttonStyle === 'primary' ? '#1960a4' : 'transparent',
          margin: bottomMargin0 ? '0px' : '14px',
        }}
      >
        <span {...rest} />
      </button>
      {children}
    </div>)),
  DropdownMenu: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  Checkbox: jest.fn(({
    label,
    checked,
    value,
    onChange,
    disabled,
    ...rest
  }) => {
    return (
      <div data-test-checkbox="true" {...rest}>
        <label htmlFor="checkbox">
          <input
            id="checkbox"
            type="checkbox"
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
          <span className="labelText">{label}</span>
        </label>
      </div>
    );
  }),
}));
