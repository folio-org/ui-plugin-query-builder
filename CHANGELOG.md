# Change history for ui-plugin-query-builder

## (in progress)

## [1.1.2](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.1.2) (2024-03-22)

* [UIPQB-101](https://folio-org.atlassian.net/browse/UIPQB-101) Fix crash when attempting to edit a query with null/empty operator
* [UIPQB-104](https://folio-org.atlassian.net/browse/UIPQB-104) Use original fields when provided for editing a query, instead of the defaults
* [UIPQB-90](https://folio-org.atlassian.net/browse/UIPQB-90) Auto-hide failure toast messages

## [1.1.1](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.1.1) (2024-03-20)

* Update `@folio/stripes-acq-components` to `~5.1.0`

## [1.1.0](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.1.0) (2024-03-19)

* [UIPQB-60](https://folio-org.atlassian.net/browse/UIPQB-60) 'In' and 'Not In' requests not properly formatted for [Users] "User ID"
* [UIPQB-56](https://folio-org.atlassian.net/browse/UIPQB-56) Prevent columns from being reset when query is changed
* [UIPQB-67](https://folio-org.atlassian.net/browse/UIPQB-67) Styles are defined globally for inputs with type "number"
* [UIPQB-64](https://folio-org.atlassian.net/browse/UIPQB-64) Query builder can’t edit single condition queries without AND wrapper
* [UIPQB-53](https://folio-org.atlassian.net/browse/UIPQB-53) Add support for $contains and $not_contains operators
* [UIPQB-66](https://folio-org.atlassian.net/browse/UIPQB-66) Localize dates in results view.
* [UIPQB-54](https://folio-org.atlassian.net/browse/UIPQB-54) Add support for array fields in query results.
* [UIPQB-70](https://folio-org.atlassian.net/browse/UIPQB-70) Array fields support verification.
* [UIPQB-80](https://folio-org.atlassian.net/browse/UIPQB-80) Add operators for NumberType and adjust operators for IntegerType.
* [UIPQB-73](https://folio-org.atlassian.net/browse/UIPQB-73) Result Viewer shows current date if date column is not present.
* [UIPQB-82](https://folio-org.atlassian.net/browse/UIPQB-82) [Query Builder] Support querying based on nested objects within arrays.
* [UIPQB-84](https://folio-org.atlassian.net/browse/UIPQB-84) Results viewer doesn't show 0 value for number type.
* [UIPQB-78](https://folio-org.atlassian.net/browse/UIPQB-78) Query builder display if no records match the query
* [UIPQB-74](https://folio-org.atlassian.net/browse/UIPQB-74)Non-default fields that are part of the query are automatically displayed as columns
* [UIPQB-95](https://folio-org.atlassian.net/browse/UIPQB-95) Disable run query button when records limit exceeded
* [UIPQB-96](https://folio-org.atlassian.net/browse/UIPQB-96) Extend runQuery handler with "user-friendly" query param
* [UIPQB-86](https://folio-org.atlassian.net/browse/UIPQB-86) The IN operator is incorrectly rendered in the query builder when editing existing queries

## [1.0.0](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.0.0) (2023-10-12)

* [UIPQB-1](https://folio-org.atlassian.net/browse/UIPQB-1) Query plugin - project setup.
* [UIPQB-5](https://folio-org.atlassian.net/browse/UIPQB-5) Field-action-value component: String.
* [UIPQB-9](https://folio-org.atlassian.net/browse/UIPQB-9) Date-time property format - action-value component
* [UIPQB-11](https://folio-org.atlassian.net/browse/UIPQB-11) Enum property type - action-value component.
* [UIPQB-4](https://folio-org.atlassian.net/browse/UIPQB-4) UUIDs: field-action-value component.
* [UIPQB-10](https://folio-org.atlassian.net/browse/UIPQB-10) Object property type - action-value component
* [UIPQB-6](https://folio-org.atlassian.net/browse/UIPQB-6) Array property type - action-value component.
* [UIPQB-14](https://folio-org.atlassian.net/browse/UIPQB-14) Build query string
* [UIPQB-17](https://folio-org.atlassian.net/browse/UIPQB-17) Test query
* [UIPQB-28](https://folio-org.atlassian.net/browse/UIPQB-28) Update QueryBuilder Component to work with MongoDB-Compliant JSON Query
* [UIPQB-27](https://folio-org.atlassian.net/browse/UIPQB-27) Title: Extend QueryBuilder plugin with 'saveBtnLabel' Prop
* [UIPQB-30](https://folio-org.atlassian.net/browse/UIPQB-30) Create pulling mechanism for query-builder-plugin
* [UIPQB-33](https://folio-org.atlassian.net/browse/UIPQB-33) Aborting long running query
* [UIPQB-35](https://folio-org.atlassian.net/browse/UIPQB-35) Incorrect parsing for multiselect values
* [UIPQB-40](https://folio-org.atlassian.net/browse/UIPQB-40) Change rendering behavior with IN operator
* [UIPQB-37](https://folio-org.atlassian.net/browse/UIPQB-37) Reset form to original state after user cancel out
* [UIPQB-36](https://folio-org.atlassian.net/browse/UIPQB-36) Add X button for closing the form
* [UIPQB-26](https://folio-org.atlassian.net/browse/UIPQB-26) Validate value entered for integer property type
* [UIPQB-43](https://folio-org.atlassian.net/browse/UIPQB-43) *BREAKING* upgrade React to v18.
* [UIPQB-44](https://folio-org.atlassian.net/browse/UIPQB-44) Update Node.js to v18 in GitHub Actions.
* [UIPQB-49](https://folio-org.atlassian.net/browse/UIPQB-49) Jest-related deps are used in development only.
* [UIPQB-52](https://folio-org.atlassian.net/browse/UIPQB-52) *BREAKING* bump `react-intl` to `v6.4.4`.
* [UIPQB-45](https://folio-org.atlassian.net/browse/UIPQB-45) Query builder dies when certain characters are used in combination with regex operators.
* [UIPQB-46](https://folio-org.atlassian.net/browse/UIPQB-46) Incorrect text when no options available in the query builder's search bar.
* [UIPQB-50](https://folio-org.atlassian.net/browse/UIPQB-50)Add 'in-progress' handling to plugin-query-builder
* [UIPQB-48](https://folio-org.atlassian.net/browse/UIPQB-48) "Show columns" dropdown doesn't fit in the screen.
* [UIPQB-47](https://folio-org.atlassian.net/browse/UIPQB-47) 400 error blocks save or further action in query builder.
* [UIPQB-51](https://folio-org.atlassian.net/browse/UIPQB-51) Dropdown typeahead should use contains not starts with.
* [UIPQB-57](https://folio-org.atlassian.net/browse/UIPQB-57) 400 error should be reported in the UI
* [UIPQB-55](https://folio-org.atlassian.net/browse/UIPQB-55) Regular expressions are incorrect for contains and starts_with operators
* [UIPQB-70](https://folio-org.atlassian.net/browse/UIPQB-70) Array fields support verification
* [UIPQB-71](https://folio-org.atlassian.net/browse/UIPQB-71) Allow dropdown menus for array types
* [UIPQB-75](https://folio-org.atlassian.net/browse/UIPQB-75) Display grouped fields within a list row
* [UIPQB-83](https://folio-org.atlassian.net/browse/UIPQB-83) Add API for tracking selected columns in the query builder modal.
