'use client';

import { useEffect } from 'react';

interface AdSenseBlockProps {
  adSlot: string;
  adFormat?: string;
  adLayoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
  fullWidthResponsive?: boolean;
}

export default function AdSenseBlock({
  adSlot,
  adFormat = 'auto',
  adLayoutKey,
  className,
  style = { display: 'block' },
  fullWidthResponsive = true,
}: AdSenseBlockProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-9187440931404634"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={String(fullWidthResponsive)}
      ></ins>
    </div>
  );
}
