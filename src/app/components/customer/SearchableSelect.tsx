import { useState, useCallback, useRef, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../ui/utils";
import { fold } from "../../assets/address/addressHelpers";

export interface SelectOption {
  value: string;  // unique id (e.g. district level2_id or ward level3_id)
  label: string;  // display text (e.g. "Quận Ba Đình")
}

interface SearchableSelectProps {
  /** Placeholder when nothing selected */
  placeholder: string;
  /** Currently selected value (the `value` field of the option) */
  value?: string;
  /** All available options */
  options: SelectOption[];
  /** Called with the selected option */
  onSelect: (option: SelectOption) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Allow clearing the selection */
  allowClear?: boolean;
}

export default function SearchableSelect({
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
  error = false,
  allowClear = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label ?? "";

  // Filter options based on search (case-insensitive, accent-insensitive)
  const filtered = search
    ? options.filter((o) => fold(o.label).includes(fold(search)))
    : options;

  const handleSelect = useCallback(
    (option: SelectOption) => {
      onSelect(option);
      setOpen(false);
      setSearch("");
    },
    [onSelect]
  );

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={`Tìm kiếm...`}
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {allowClear && value && (
            <div className="border-t border-border p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-muted-foreground text-xs"
                onClick={() => {
                  handleSelect({ value: "", label: "" });
                  setOpen(false);
                }}
              >
                Bỏ chọn
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}