import { useEffect, useRef, useState } from "react";

// Price badle to 1 sec ke liye "flash-up" / "flash-down" class deta hai
export function usePriceFlash(value) {
  const prev = useRef(value);
  const [cls, setCls] = useState("");

  useEffect(() => {
    if (prev.current != null && value !== prev.current) {
      setCls(value > prev.current ? "flash-up" : "flash-down");
      const t = setTimeout(() => setCls(""), 1000);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  return cls;
}