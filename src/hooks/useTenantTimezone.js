import { userLocaleConfig, useStripes, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';

export function getQueryWarning(tenantTimezone, userTimezone) {
  if (tenantTimezone === userTimezone) {
    return null;
  }
  if (!tenantTimezone || !userTimezone) {
    return null;
  }

  // TODO: add a warning here!, and also use this...
  return 'a warning should go here! TODO [UIPQB-155]';
}

export async function getConfigEntryTimezone(ky, query) {
  return JSON.parse(
    (
      await ky
        .get('configurations/entries', {
          searchParams: {
            query,
          },
        })
        .json()
    ).configs?.[0].value ?? '{}',
  ).timezone;
}

/**
 * Determines the timezone that should be used when building a query and displaying results.
 *
 * We specifically do NOT want the user's timezone, as this may cause weird inconsistencies
 * if the same queries are run by different users in the same tenant. As such, we will always
 * use the tenant's timezone.
 *
 * Additionally, the backend will always use the tenant's timezone when exporting queries, so
 * we want to ensure expectations are met across the board.
 *
 * @returns `{
 *   userTimezone?: string;
 *   tenantTimezone?: string;
 *   timezoneQueryWarning: ReactNode;
 * }`
 * `userTimezone`: The timezone of the current user if an override exists, the timezone of the
 *                 tenant if no override exists, or undefined if queries are still resolving.
 * `tenantTimezone`: The timezone of the tenant, or undefined if the query is still resolving.
 * `timezoneQueryWarning`: A warning message that should be displayed if the query contains
 *                         date fields. Will only be present iff userTimezone ≠ tenantTimezone.
 */
export default function useTenantTimezone() {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const tenantTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'tenant'],
    queryFn: () => getConfigEntryTimezone(
      ky,
      `(${[
        'module==ORG',
        'configName == localeSettings',
        '(cql.allRecords=1 NOT userId="" NOT code="")',
      ].join(' AND ')})`,
    ),
    refetchOnMount: false,
  });

  const userTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'user'],
    queryFn: () => getConfigEntryTimezone(
      ky,
      `(${Object.entries({ ...userLocaleConfig, userId: stripes.user.user.id })
        .map(([k, v]) => `"${k}"=="${v}"`)
        .join(' AND ')})`,
    ),
    refetchOnMount: false,
  });

  return {
    userTimezone: userTimezone.data ?? tenantTimezone.data,
    tenantTimezone: tenantTimezone.data,
    timezoneQueryWarning: getQueryWarning(tenantTimezone.data, userTimezone.data),
  };
}
