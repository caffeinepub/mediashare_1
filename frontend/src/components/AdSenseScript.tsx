import { useEffect } from 'react';
import { useGetAdSensePublisherId } from '../hooks/useAdSenseConfig';

export function AdSenseScript() {
  const { data: publisherId } = useGetAdSensePublisherId();

  useEffect(() => {
    if (!publisherId) return;

    const existingScript = document.querySelector('script[data-adsense]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsense', 'true');
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector('script[data-adsense]');
      if (s) document.head.removeChild(s);
    };
  }, [publisherId]);

  return null;
}
