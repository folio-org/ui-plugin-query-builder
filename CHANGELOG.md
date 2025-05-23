# Change history for ui-plugin-query-builder

## [3.0.0] IN PROGRESS

* [UIPQB-195](https://folio-org.atlassian.net/browse/UIPQB-195) Filter out deleted custom field values
* [UIPQB-217](https://folio-org.atlassian.net/browse/UIPQB-217) *BREAKING* useTenantTimezone - use mod-settings API.

## [2.0.3](https://github.com/folio-org/ui-plugin-query-builder/tree/v2.0.3) (2025-04-18)

* [UIPQB-204](https://folio-org.atlassian.net/browse/UIPQB-204) Add plugin-find-organization for "Organization — Name" and "Organization — Code" (additional work)
* [UIPQB-207](https://folio-org.atlassian.net/browse/UIPQB-207) Resolve an error where multiple dropdown values would result in invalid user-friendly queries
* [UIPQB-208](https://folio-org.atlassian.net/browse/UIPQB-208) Don't display invalid fields in lists
* [UIPQB-209](https://folio-org.atlassian.net/browse/UIPQB-209) Add user-friendly query display to `ResultViewer`

## [2.0.2](https://github.com/folio-org/ui-plugin-query-builder/tree/v2.0.2) (2025-04-10)

* [UIPQB-204](https://folio-org.atlassian.net/browse/UIPQB-204) Add plugin-find-organization for "Organization — Name" and "Organization — Code"
* [UIPQB-206](https://folio-org.atlassian.net/browse/UIPQB-206) Expose `setIsModalShown` prop for consumers to know when the modal is open

## [2.0.1](https://github.com/folio-org/ui-plugin-query-builder/tree/v2.0.1) (2025-03-26)

* [UIPQB-202](https://folio-org.atlassian.net/browse/UIPQB-202) Columns reset after editing and saving a query.
* [UIPQB-196](https://folio-org.atlassian.net/browse/UIPQB-196) Make the query builder display lists of columns in the order in which they come back from mod-fqm-manager.
* [UIPQB-194](https://folio-org.atlassian.net/browse/UIPQB-194) The placeholder "Select value" appears as the selected option in the "Values" dropdown.
* [UIPQB-206](https://folio-org.atlassian.net/browse/UIPQB-206) Expose `setIsModalShown` prop for consumers to know when the modal is open

## [2.0.0](https://github.com/folio-org/ui-plugin-query-builder/tree/v2.0.0) (2025-03-12)

* [UIPQB-164](https://folio-org.atlassian.net/browse/UIPQB-164) Columns are reset when user modifies query.
* [UIPQB-182](https://folio-org.atlassian.net/browse/UIPQB-182) Add ability to remove first query parameter.
* [UIPQB-181](https://folio-org.atlassian.net/browse/UIPQB-181) The user-friendly query contains random dates instead of true/false values.
* [UIPQB-180](https://folio-org.atlassian.net/browse/UIPQB-180) Don't reset 'Value' when operator is changed
* [UIPQB-183](https://folio-org.atlassian.net/browse/UIPQB-183) Show custom field labels in "Query" box of query builder.
* [UIPQB-184](https://folio-org.atlassian.net/browse/UIPQB-184) Show array field labels in "Query" box of query builder.
* [UIPQB-187](https://folio-org.atlassian.net/browse/UIPQB-187) Ignore/remove invalid values for dropdown fields when editing a query in the query builder.
* [UIPQB-192](https://folio-org.atlassian.net/browse/UIPQB-192) Query builder shouldn't show 0 results when a query fails.
* [UIPQB-198](https://folio-org.atlassian.net/browse/UIPQB-198) The columns are missing in the "Actions" dropdown, after modifying the list.
* [UIPQB-190](https://folio-org.atlassian.net/browse/UIPQB-190) *BREAKING* migrate react-intl to v7.
* [UIPQB-189](https://folio-org.atlassian.net/browse/UIPQB-189) *BREAKING* migrate stripes-* dependencies.

## [1.2.9](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.9) (2025-01-22)

* [UIPQB-185](https://folio-org.atlassian.net/browse/UIPQB-185) Missing spaces and pipe delimiter for some fields.

## [1.2.8](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.8) (2025-01-09)

* [UIPQB-141](https://folio-org.atlassian.net/browse/UIPQB-141) Modal dialog focus inconsistencies across screenreaders.
* [UIPQB-162](https://folio-org.atlassian.net/browse/UIPQB-162) Errors when query includes a modified custom field.
* [UIPQB-175](https://folio-org.atlassian.net/browse/UIPQB-175) Displays the "Something went wrong" page, when the user clicks on "Select operator" dropdown and selects any of them, if there are deleted custom fields.
* [UIPQB-179](https://folio-org.atlassian.net/browse/UIPQB-179) Fix string-based booleans improperly displaying.

## [1.2.7](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.7) (2024-12-26)

* [UIPQB-168](https://folio-org.atlassian.net/browse/UIPQB-168) Allow editing queries containing no fields.

## [1.2.6](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.6) (2024-12-11)

* [UIPQB-128](https://folio-org.atlassian.net/browse/UIPQB-128) Invalid fields handling > Errors when query includes a deleted custom field.

## [1.2.5](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.5) (2024-12-04)

* [UIPQB-159](https://folio-org.atlassian.net/browse/UIPQB-159) [Lists] Empty columns are displaying when the user duplicates the list and the refresh is in progress
* [UIPQB-160](https://folio-org.atlassian.net/browse/UIPQB-160) [QB] Update the text in the query builder after 3 attempts result in 500 errors.

## [1.2.4](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.4) (2024-11-27)

* [UIPQB-126](https://folio-org.atlassian.net/browse/UIPQB-126) Use tenant timezeone instead of tenant timezone.
* [UIPQB-156](https://folio-org.atlassian.net/browse/UIPQB-156) Nested table data display is inconsistent with regular result viewer.
* [UIPQB-157](https://folio-org.atlassian.net/browse/UIPQB-157) Add stop polling mechanism for useAsyncDataSource after 3 retries.
* [UIPQB-158](https://folio-org.atlassian.net/browse/UIPQB-158) “No matching items found!” displayed when it takes longer to populate dropdown.

## [1.2.3](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.3) (2024-11-12)

* [UIPQB-126](https://folio-org.atlassian.net/browse/UIPQB-126) Convert local date to UTC with respect to tenant zone, rather than user.

## [1.2.2](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.2) (2024-11-08)

* [UIPQB-102](https://folio-org.atlassian.net/browse/UIPQB-102) The 'Organization accounting code' value contains incorrect '\'(backslash) in the query.
* [UIPQB-147](https://folio-org.atlassian.net/browse/UIPQB-147) Filtering of available values is case sensitive.
* [UIPQB-138](https://folio-org.atlassian.net/browse/UIPQB-138) It's not possible to select the current date from the DatePicker.

## [1.2.1](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.1) (2024-10-31)
* Bump version to v1.2.1

## [1.2.0](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.2.0) (2024-10-30)

* [UIPQB-113](https://issues.folio.org/browse/UIPQB-113) Remove local QueryClientProvider from plugin-query-builder
* [UIPQB-103](https://issues.folio.org/browse/UIPQB-103) Correct formatting of in and not in operators in query string.
* [UIPQB-115](https://issues.folio.org/browse/UIPQB-115) Array type fields display strangely on the list details page, after adding them.
* [UIPQB-117](https://folio-org.atlassian.net/browse/UIPQB-117)Add debounce for contentQueryKeys in useAsyncDataSource
* [UIPQB-105](https://folio-org.atlassian.net/browse/UIPQB-106) The selected field doesn't display in the record table when we edit the query.
* [UIPQB-116](https://folio-org.atlassian.net/browse/UIPQB-116) Correct formatting of in and not in operators in query string when “Value“ column contains text box
* [UIPQB-112](https://folio-org.atlassian.net/browse/UIPQB-112) Query builder: Accessibility: Not equal operator value is not read by screenreader
* [UIPQB-119](https://folio-org.atlassian.net/browse/UIPQB-119) Filter column names
* [UIPQB-79](https://folio-org.atlassian.net/browse/UIPQB-79) Update available operators for arrays
* [UIPQB-131](https://folio-org.atlassian.net/browse/UIPQB-131) Columns and empty area display in the list details page, when we refresh the page 1st time or duplicate the list
* [UIPQB-132](https://folio-org.atlassian.net/browse/UIPQB-132) Save not empty previews results and show it in test query
* [UIPQB-126](https://folio-org.atlassian.net/browse/UIPQB-126) Update date format in requests to UTC
* [UIPQB-125](https://folio-org.atlassian.net/browse/UIPQB-125) Add support for FQM _version
* [FOLIO-4086](https://folio-org.atlassian.net/browse/FOLIO-4086) Fix GitHub Actions workflow not running for tags
* [UIPQB-133](https://folio-org.atlassian.net/browse/UIPQB-133) Add getFilteredOptions function for enhanced option filtering
* [UIPQB-137](https://folio-org.atlassian.net/browse/UIPQB-137) Spell out query builder operators
* [UIPQB-140](https://folio-org.atlassian.net/browse/UIPQB-140) fix preview to display records when result is more than 100
* [UIPQB-143](https://folio-org.atlassian.net/browse/UIPQB-143) Translate language codes to languages in the ResultsViewer
* Bump "@folio/stripes-acq-components" version to v6.0.0

## [1.1.4](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.1.4) (2024-04-02)

* [UIPQB-108](https://issues.folio.org/browse/UIPQB-108) Fix missing horizontal overflow in ResultViewer

## [1.1.3](https://github.com/folio-org/ui-plugin-query-builder/tree/v1.1.3) (2024-04-02)

* [UIPQB-86](https://folio-org.atlassian.net/browse/UIPQB-86) The IN operator is incorrectly rendered in the query builder when editing existing queries

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
* [UIPQB-124](https://folio-org.atlassian.net/browse/UIPQB-124) Switching array operators disables the "Test" button

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
