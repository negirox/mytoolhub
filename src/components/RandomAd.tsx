
import { useMemo } from "react";
import GoogleAd from "./GoogleAd";

const adConfigs = [
  { slot: "3078648308", format: "fluid", layoutKey: "-f8+2q+2i-1l-4x" },
  { slot: "7694311040", format: "fluid", layout: "in-article" },
  { slot: "9089081944", format: "autorelaxed" },
  { slot: "5342210952", format: "auto" },
];

export default function RandomAd() {
  const randomConfig = useMemo(
    () => adConfigs[Math.floor(Math.random() * adConfigs.length)],
    []
  );

  return <GoogleAd {...randomConfig} />;
}
