import {
  useStripes,
  useTenantPreferences,
  usePreferences,
  userOwnLocaleConfig,
  tenantLocaleConfig,
} from '@folio/stripes/core';
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
  const { getTenantPreference } = useTenantPreferences();
  const { getPreference } = usePreferences();
  const userId = stripes.user.user.id;
  const tenantId = stripes.okapi.tenant;
  const userScope = userOwnLocaleConfig.SCOPE;
  const tenantScope = tenantLocaleConfig.SCOPE;
  const userKey = userOwnLocaleConfig.KEY;
  const tenantKey = tenantLocaleConfig.KEY;

  const tenantTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'tenant', tenantId, tenantScope, tenantKey],
    queryFn: async () => {
      const settings = await getTenantPreference({
        scope: tenantScope,
        key: tenantKey,
      });

      return settings?.timezone;
    },
    refetchOnMount: false,
  });

  const userTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'user', userId, tenantId, userScope, userKey],
    queryFn: async () => {
      const settings = await getPreference({
        scope: userScope,
        key: userKey,
        userId: stripes.user.user.id,
      });

      return settings?.timezone;
    },
    refetchOnMount: false,
  });

  return {
    userTimezone: userTimezone.data ?? tenantTimezone.data,
    tenantTimezone: tenantTimezone.data,
    timezoneQueryWarning: getQueryWarning(tenantTimezone.data, userTimezone.data),
  };
}