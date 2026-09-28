"use client";

import { useEffect } from "react";

export function HtmxLoader() {
  useEffect(() => {
    import("htmx.org");
  }, []);

  return null;
}
