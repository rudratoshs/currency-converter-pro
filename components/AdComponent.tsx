"use client";

import { useEffect } from "react";

interface AdComponentProps {
  adSlot: string;
  className?: string;
}

const AdComponent: React.FC<AdComponentProps> = ({ adSlot, className }) => {
  useEffect(() => {
    // Dynamically load the AdSense script
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.adClient = "ca-pub-4058854109696799";
    document.head.appendChild(script);

    // Initialize ads if the script is loaded
    const initializeAds = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense initialization error:", error);
      }
    };

    script.onload = initializeAds;

    return () => {
      // Cleanup script if the component is unmounted
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className={className || "ads-container"}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4058854109696799"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdComponent;