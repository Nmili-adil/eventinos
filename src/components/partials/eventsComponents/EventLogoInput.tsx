import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { ImageIcon, Link, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EventLogoInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string | File | undefined;
  onChange: (value: string | File) => void;
  disabled?: boolean;
  placeholder: string;
  chooseLabel?: string;
  clearLabel?: string;
}

export const EventLogoInput = forwardRef<HTMLDivElement, EventLogoInputProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      placeholder,
      chooseLabel = "Choose",
      clearLabel = "Clear",
      className,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [objectUrl, setObjectUrl] = useState<string>("");
    const [imageFailed, setImageFailed] = useState(false);

    const isFileValue = typeof File !== "undefined" && value instanceof File;
    const stringValue = typeof value === "string" ? value : "";
    const fileName = isFileValue ? value.name : "";
    const previewSrc = isFileValue ? objectUrl : stringValue;

    useEffect(() => {
      setImageFailed(false);

      if (!(typeof File !== "undefined" && value instanceof File)) {
        setObjectUrl("");
        return;
      }

      const nextUrl = URL.createObjectURL(value);
      setObjectUrl(nextUrl);

      return () => URL.revokeObjectURL(nextUrl);
    }, [value]);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-slate-200 bg-slate-50/70 p-2 shadow-sm",
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
            {previewSrc && !imageFailed ? (
              <img
                src={previewSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={disabled}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onChange(file);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 flex-1 gap-2"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                {chooseLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={clearLabel}
                disabled={disabled || !value}
                onClick={() => onChange("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="relative">
              <Link className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder={placeholder}
                value={stringValue}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
              />
            </div>

            {fileName && (
              <p className="truncate text-xs text-muted-foreground">{fileName}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

EventLogoInput.displayName = "EventLogoInput";
