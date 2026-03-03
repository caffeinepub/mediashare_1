import { useEffect, useRef } from 'react';
import { useGetAdSensePublisherId } from '../hooks/useAdSenseConfig';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
}

export function AdSenseUnit({ adSlot, adFormat = 'auto', className = '' }: AdSenseUnitProps) {
  const { data: publisherId } = useGetAdSensePublisherId();
  const initialized = useRef(false);

  useEffect(() => {
    if (!publisherId || initialized.current) return;
    initialized.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // Silently ignore AdSense errors
    }
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div className={`adsense-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
