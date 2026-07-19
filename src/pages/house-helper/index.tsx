import React, { useLayoutEffect, useRef } from "react";
import HouseHelperList from "./HouseHelperList";

const HouseHelperPage: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement as HTMLElement | null;
    if (!parent) return;
    const prev = parent.style.padding;
    parent.style.padding = "0";
    return () => { parent.style.padding = prev; };
  }, []);

  return (
    <div ref={ref} style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HouseHelperList />
    </div>
  );
};

export default HouseHelperPage;
