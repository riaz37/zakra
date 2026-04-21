"use client";

import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_GROUPS, SETTINGS_ITEM } from "./nav";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search navigation, users, connections, reports…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.label}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group.label.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={item.id} value={item.label} onSelect={() => go(item.href)}>
                    <Icon className="size-4" strokeWidth={1.75} />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem value="settings" onSelect={() => go(SETTINGS_ITEM.href)}>
            <SETTINGS_ITEM.icon className="size-4" strokeWidth={1.75} />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
