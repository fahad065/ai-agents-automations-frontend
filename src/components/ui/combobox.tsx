"use client";

// Platform-wide dropdown convention (established 2026-11-11, per explicit
// user request): every new dropdown in this codebase should be built on
// this component, not a native <select> or a hand-rolled button-grid.
// Click opens a popover with a search input filtering the list below;
// a selected value shows a clear "X" on the right of the trigger field.
// See CLAUDE.md's "Dropdown convention" section for the full rule and
// when a plain native <select> is still fine to use instead (a single
// boolean-ish toggle with 2-3 options rarely benefits from a search box).
import * as React from "react";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  /** Show the clear "X" once a value is selected. Default true. */
  allowClear?: boolean;
  /**
   * Lets the user type a value that isn't in `options` — shows a
   * "Add "<query>"" row that calls onChange with the raw typed text.
   * Use this for fields where the option list is a suggestion, not a
   * closed set (e.g. a provider name, a free-form tag).
   */
  creatable?: boolean;
  createLabel?: (query: string) => string;
  id?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  contentClassName,
  disabled,
  allowClear = true,
  creatable = false,
  createLabel,
  id,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  // Falls back to showing the raw value itself when `creatable` and the
  // current value was typed in rather than picked from `options` — e.g. a
  // custom provider name that isn't in the preset list.
  const selected =
    options.find((o) => o.value === value) ?? (creatable && value ? { value, label: value } : undefined);

  // Reset the search box each time the popover opens, so it never opens
  // showing a stale filter from the last time it was used.
  React.useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const showCreateRow =
    creatable &&
    search.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 text-left text-sm text-foreground outline-none transition-colors",
            "hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50",
            allowClear && selected ? "pr-8" : "",
          )}
        >
          <span className={cn("flex min-w-0 flex-1 items-center gap-1.5 truncate", !selected && "text-muted-foreground")}>
            {selected?.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        {allowClear && selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}

        <PopoverContent
          align="start"
          className={cn("w-(--anchor-width) min-w-56 p-0", contentClassName)}
        >
          <Command shouldFilter={!creatable}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {!showCreateRow && <CommandEmpty>{emptyText}</CommandEmpty>}
              <CommandGroup>
                {(creatable
                  ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
                  : options
                ).map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    disabled={opt.disabled}
                    data-checked={opt.value === value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </CommandItem>
                ))}
                {showCreateRow && (
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={() => {
                      onChange(search.trim());
                      setOpen(false);
                    }}
                  >
                    {createLabel ? createLabel(search.trim()) : `Add "${search.trim()}"`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
