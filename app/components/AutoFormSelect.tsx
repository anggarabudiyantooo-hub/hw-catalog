"use client";
import type { CSSProperties, ReactNode } from "react";

/** <select> yang otomatis submit form induknya saat nilai berubah (hanya untuk dipakai DI DALAM <form>). */
export default function AutoFormSelect({
  name,
  defaultValue = "",
  children,
  style,
}: {
  name: string;
  defaultValue?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      style={style}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {children}
    </select>
  );
}
