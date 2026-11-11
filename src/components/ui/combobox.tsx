"use client";

// Platform-wide dropdown convention (established 2026-11-11, per explicit
// user request): every new dropdown in this codebase should be built on
// this component, not a native <select> or a hand-rolled button-grid.
// Click opens a popover with a search input filtering the list below; a
// selected value always shows a clear "X" on the right of the trigger
// field (unless `allowClear={false}` is passed explicitly for a field
// with no real "none" state). See CLAUDE.md's "Dropdown convention"
// section for the full rule.
import * as React from "react";
import { ChevronDownIcon, XIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
   * Adds an always-visible "Other — add a new <thing>" row at the bottom
   * of the list. Selecting it swaps the popover to a dedicated text input
   * (not just typing in the search box) — use this for fields where the
   * option list is a suggestion, not a closed set (a provider name, a
   * free-form tag), and the custom option needs to be as discoverable as
   * the preset ones.
   */
  creatable?: boolean;
  /** Label for the always-visible "Other" row. Default "Other". */
  createRowLabel?: string;
  /** Placeholder for the dedicated new-value input. */
  createInputPlaceholder?: string;
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
  createRowLabel = "Other — add a new one",
  createInputPlaceholder = "Type a name...",
  id,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [creatingNew, setCreatingNew] = React.useState(false);
  const [newValue, setNewValue] = React.useState("");

  // Falls back to showing the raw value itself when `creatable` and the
  // current value was typed in rather than picked from `options` — e.g. a
  // custom provider name that isn't in the preset list.
  const selected =
    options.find((o) => o.value === value) ?? (creatable && value ? { value, label: value } : undefined);

  // Reset to a clean "just opened" state every time the popover opens, so
  // it never shows a stale filter or a half-finished "add new" form from
  // the last time it was used.
  React.useEffect(() => {
    if (open) {
      setSearch("");
      setCreatingNew(false);
      setNewValue("");
    }
  }, [open]);

  const filteredOptions = creatable
    ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const confirmCreate = () => {
    if (!newValue.trim()) return;
    onChange(newValue.trim());
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm text-foreground outline-none transition-colors",
            "hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50",
            // Reserve room on the right for the chevron (always) and the
            // clear "X" (when shown) with real space between them, instead
            // of letting both icons fight over the same few pixels.
            allowClear && selected ? "pr-14" : "pr-8",
          )}
        >
          <span className={cn("flex min-w-0 flex-1 items-center gap-1.5 truncate", !selected && "text-muted-foreground")}>
            {selected?.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
        </PopoverTrigger>

        {/* Chevron — fixed in place, never shares space with the clear
            button; pointer-events-none so clicks still reach the trigger
            underneath it. */}
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 shrink-0 text-muted-foreground opacity-50" />

        {allowClear && selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}

        <PopoverContent
          align="start"
          className={cn("w-(--anchor-width) min-w-56 p-0", contentClassName)}
        >
          {creatingNew ? (
            <div className="p-3">
              <p className="mb-2 text-xs font-medium text-foreground">Add a new one</p>
              <div className="flex gap-1.5">
                <Input
                  autoFocus
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={createInputPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmCreate();
                    if (e.key === "Escape") setCreatingNew(false);
                  }}
                />
                <Button type="button" size="sm" onClick={confirmCreate} disabled={!newValue.trim()}>
                  Add
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setCreatingNew(false)}
                className="mt-2 text-xs text-muted-foreground outline-none hover:text-foreground"
              >
                ← Back to list
              </button>
            </div>
          ) : (
            <Command shouldFilter={!creatable}>
              <CommandInput value={search} onValueChange={setSearch} placeholder={searchPlaceholder} />
              <CommandList>
                {filteredOptions.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}
                <CommandGroup>
                  {filteredOptions.map((opt) => (
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
                </CommandGroup>
                {creatable && (
                  <CommandGroup>
                    <CommandItem
                      value="__create_new__"
                      onSelect={() => setCreatingNew(true)}
                      className="text-muted-foreground"
                    >
                      <PlusIcon className="size-4" />
                      <span>{createRowLabel}</span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
