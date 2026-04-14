import {
  useOkapiKy,
  useStripes,
  usePreferences,
  // userOwnLocaleConfig,
  // tenantLocaleConfig,
  userLocaleConfig,
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

  const { getPreference } = usePreferences();

  const userId = stripes.user.user.id;
  const tenantId = stripes.okapi.tenant;

  // stripes-core@11.0.14 exposes only userLocaleConfig, so we use it as the
  // configuration key and resolve tenant-level values via mod-configuration.
  const configName = userLocaleConfig.configName;
  const moduleName = userLocaleConfig.module;

  const tenantTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'tenant', tenantId, moduleName, configName],
    queryFn: async () => {
      // If getPreference supports tenant-scoped values in this Stripes version,
      // prefer it.
      try {
        const settings = await getPreference({
          scope: moduleName,
          key: configName,
        });

        if (settings?.timezone) return settings.timezone;
      } catch (e) {
        // fall through to direct fetch
      }

      // Fallback: fetch tenant-level locale settings directly.
      const ky = stripes.okapi.ky;
      const res = await ky.get('configurations/entries', {
        searchParams: {
          query: `(module==${moduleName} and configName==${configName})`,
          limit: 1,
        },
      }).json();

      const entry = res?.configs?.[0];
      const value = entry?.value ? JSON.parse(entry.value) : undefined;
      return value?.timezone;
    },
    refetchOnMount: false,
  });

  const userTimezone = useQuery({
    queryKey: ['@folio/plugin-query-builder', 'timezone-config', 'user', userId, tenantId, moduleName, configName],
    queryFn: async () => {
      const settings = await getPreference({
        scope: moduleName,
        key: configName,
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
