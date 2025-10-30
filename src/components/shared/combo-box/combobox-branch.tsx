"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";

interface Branch {
  branchID: string;
  branchkh: string;
}

interface ComboboxSelectBranchProps {
  dataSelect: Branch | null;
  onChangeSelected: (item: Branch | null) => void;
  disabled?: boolean;
  branches: Branch[];
  isLoading?: boolean;
}

export function ComboboxSelectBranch({
  dataSelect,
  onChangeSelected,
  disabled = false,
  branches,
  isLoading = false,
}: ComboboxSelectBranchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // change language
  const translate = useTranslations("common");

  // Filter branches based on search term
  const filteredBranches = useMemo(() => {
    if (!searchTerm) return branches;
    
    const lowerSearch = searchTerm.toLowerCase();
    return branches.filter((branch) =>
      branch.branchkh.toLowerCase().includes(lowerSearch)
    );
  }, [branches, searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-10 flex-1 justify-between",
            !dataSelect && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {isLoading
            ? translate("loading")
            : dataSelect
            ? dataSelect.branchkh
            : translate("chooseOne")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search branch..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <CommandEmpty>No branch found.</CommandEmpty>
            <CommandGroup>
              {filteredBranches?.map((branch) => (
                <CommandItem
                  key={branch.branchID}
                  value={branch.branchkh}
                  onSelect={() => {
                    onChangeSelected(branch);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dataSelect?.branchID === branch.branchID
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {branch.branchkh}
                </CommandItem>
              ))}
            </CommandGroup>

            {isLoading && (
              <div className="text-center py-2">
                <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}