import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

// Announces the loading state to screen readers (WCAG 4.1.3 Status Messages).
// The spinner shown while refreshing/retrieving results otherwise has no
// accessible notification, since it replaces table content without any
// surrounding text change.
export const useViewerSRStatus = ({ isLoading }) => {
  const intl = useIntl();
  const readerStatusRef = useRef();

  useEffect(() => {
    if (isLoading) {
      readerStatusRef.current?.sendMessage(
        intl.formatMessage({ id: 'ui-plugin-query-builder.result.inProgress' }),
      );
    }
  }, [isLoading, intl]);

  return { readerStatusRef };
};
