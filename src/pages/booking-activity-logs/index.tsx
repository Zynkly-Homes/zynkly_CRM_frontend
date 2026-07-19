import React, { useLayoutEffect, useRef } from "react";
import BookingActivityLogsList from "./BookingActivityLogsList";

const BookingActivityLogsPage: React.FC = () => {
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
      <BookingActivityLogsList />
    </div>
  );
};

export default BookingActivityLogsPage;
