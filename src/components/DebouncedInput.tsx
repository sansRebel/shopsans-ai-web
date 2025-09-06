"use client";
import { useEffect, useRef, useState } from "react";

export default function DebouncedInput({
  defaultValue = "",
  delay = 400,
  placeholder,
  onChange,
}: {
  defaultValue?: string;
  delay?: number;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [val, setVal] = useState(defaultValue);

  // keep latest onChange without re-running the debounce effect
  const cbRef = useRef(onChange);
  useEffect(() => { cbRef.current = onChange; }, [onChange]);

  // skip initial call on mount
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => cbRef.current(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);

  return (
    <input
      className="border rounded px-3 py-2 w-full"
      placeholder={placeholder}
      value={val}
      onChange={(e) => setVal(e.target.value)}
    />
  );
}
