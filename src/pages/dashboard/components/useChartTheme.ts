import { useState, useEffect } from "react";

export interface ChartTheme {
  textColor:   string;
  gridColor:   string;
  tooltipBg:   string;
  tooltipText: string;
}

function derive(): ChartTheme {
  const dark = document.documentElement.classList.contains("dark");
  return {
    textColor:   dark ? "#737373" : "#9e9e9e",
    gridColor:   dark ? "#2a2a2a" : "#e5e5e5",
    tooltipBg:   dark ? "#1a1a1a" : "#ffffff",
    tooltipText: dark ? "#e5e5e5" : "#0d0d0d",
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(derive);

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(derive()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return theme;
}
