import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  suffix,
  inputMode = "decimal",
  className,
}: {
  label?: string;
  hint?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  inputMode?: "decimal" | "numeric" | "text";
  className?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex h-7 items-center justify-between gap-2">
          <Label>{label}</Label>
          {suffix ? <span className="font-mono text-xs text-muted">{suffix}</span> : null}
        </div>
      ) : null}
      <Input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
      {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}
