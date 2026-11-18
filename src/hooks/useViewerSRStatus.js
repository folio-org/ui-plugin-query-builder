import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

// Announces a loading state to screen readers (WCAG 4.1.3 Status Messages).
// Several loading indicators in this plugin (a spinner replacing table
// content, a disabled button during a mutation, ...) otherwise have no
// accessible notification, since they don't change any surrounding text.
export const useViewerSRStatus = ({ isLoading, messageId = 'ui-plugin-query-builder.result.inProgress' }) => {
  const intl = useIntl();
  const readerStatusRef = useRef();

  useEffect(() => {
    if (isLoading) {
      readerStatusRef.current?.sendMessage(intl.formatMessage({ id: messageId }));
    }
  }, [isLoading, intl, messageId]);

  return { readerStatusRef };
};
