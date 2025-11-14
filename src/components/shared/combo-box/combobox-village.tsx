// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { VillageModel } from "@/models/address/address.response";
// import { getAllVillageService } from "@/services/address/address.service";
// import { debounce } from "@/utils/debounce/debounce";
// import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useState, useEffect, useCallback } from "react";
// import { useInView } from "react-intersection-observer";

// interface ComboboxSelectVillageProps {
//   dataSelect: VillageModel | null;
//   onChangeSelected: (item: VillageModel) => void;
//   disabled?: boolean;
//   communeCode?: string;
//   locale?: string;
// }

// export function ComboboxSelectVillage({
//   dataSelect,
//   onChangeSelected,
//   disabled = false,
//   communeCode = "",
//   locale = "en",
// }: ComboboxSelectVillageProps) {
//   const [open, setOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [data, setData] = useState<VillageModel[]>([]);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // change language
//   const translate = useTranslations("common");

//   // Intersection Observer Hook
//   const { ref, inView } = useInView({ threshold: 1 });

//   const getName = (village: VillageModel) => {
//     return locale === "kh" ? village.villageKh : village.villageEn;
//   };

//   // Fetch data from API
//   const fetchData = async (search = "", newPage = 1) => {
//     if (loading || (lastPage && newPage > 1)) return;
//     setLoading(true);
//     try {
//       const result = communeCode 
//         ? await getAllVillageService(communeCode, {
//             search,
//             pageSize: 10,
//             pageNo: newPage,
//           })
//         : await getAllVillageService("", {
//             search,
//             pageSize: 100,
//             pageNo: newPage,
//           });
//       if (!result) {
//         console.error("No data returned from getAllVillageService");
//         return;
//       }
//       if (newPage === 1) {
//         setData(result.content);
//       } else {
//         setData((prev) => [...prev, ...result.content]);
//       }
//       setPage(result.pageNo);
//       setLastPage(result.last);
//     } catch (error) {
//       console.error("Error fetching villages:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data on mount and when communeCode changes
//   useEffect(() => {
//     fetchData();
//   }, [communeCode]);

//   // Handle search input with debounce
//   useEffect(() => {
//     const delaySearch = setTimeout(() => {
//       fetchData(searchTerm, 1);
//     }, 500);

//     return () => clearTimeout(delaySearch);
//   }, [searchTerm]);

//   // Load more when last item is visible
//   useEffect(() => {
//     if (inView && !lastPage && !loading) {
//       fetchData(searchTerm, page + 1);
//     }
//   }, [inView]);

//   async function onChangeSearch(value: string) {
//     setSearchTerm(value);
//     onSearchClick(value);
//   }

//   const onSearchClick = useCallback(
//     debounce(async (value: string) => {
//       fetchData(value);
//     }),
//     [searchTerm]
//   );

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className={cn(
//             "w-full h-10 flex-1 justify-between",
//             !dataSelect && "text-muted-foreground",
//             disabled && "opacity-50 cursor-not-allowed"
//           )}
//           disabled={disabled}
//         >
//           {dataSelect ? getName(dataSelect) : "Select a village..."}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         className="w-[var(--radix-popover-trigger-width)] p-0"
//         align="start"
//       >
//         <Command>
//           <CommandInput
//             placeholder="Search village..."
//             value={searchTerm}
//             onValueChange={onChangeSearch}
//           />
//           <CommandList
//             className="max-h-60 overflow-y-auto"
//             onWheel={(e) => {
//               e.stopPropagation();
//               const target = e.currentTarget;
//               target.scrollTop += e.deltaY;
//             }}
//           >
//             <CommandEmpty>No village found.</CommandEmpty>
//             <CommandGroup>
//               {data?.map((item, index) => (
//                 <CommandItem
//                   key={item.villageCode}
//                   value={getName(item)}
//                   onSelect={() => {
//                     onChangeSelected(item);
//                     setOpen(false);
//                   }}
//                   ref={index === data.length - 1 ? ref : null}
//                 >
//                   <Check
//                     className={cn(
//                       "mr-2 h-4 w-4",
//                       dataSelect?.villageCode === item.villageCode ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                   {getName(item)}
//                 </CommandItem>
//               ))}
//             </CommandGroup>

//             {loading && (
//               <div className="text-center py-2">
//                 <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
//               </div>
//             )}
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// First part components
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
import { useState, useMemo } from "react";
import { VillageModel } from "@/models/address/address.response";
import { useTranslations } from "next-intl";

interface ComboboxSelectVillageProps {
  dataSelect: VillageModel | null;
  onChangeSelected: (item: VillageModel | null) => void;
  disabled?: boolean;
  villages: VillageModel[];
  isLoading?: boolean;
  locale?: string;
}

export function ComboboxSelectVillage({
  dataSelect,
  onChangeSelected,
  disabled = false,
  villages,
  isLoading = false,
  locale = "en",
}: ComboboxSelectVillageProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // change language
  const translate = useTranslations("common");

  const getName = (village: VillageModel) => {
    return locale === "kh" ? village.villageKh : village.villageEn;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return villages;
    
    const lowerSearch = searchTerm.toLowerCase();
    return villages.filter((village) =>
      getName(village).toLowerCase().includes(lowerSearch)
    );
  }, [villages, searchTerm, locale]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-11 flex-1 justify-between bg-white border-gray-300",
            !dataSelect && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {isLoading
            ? translate("loading")
            : dataSelect
            ? getName(dataSelect)
            : "Select a village..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search village..."
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
            <CommandEmpty>No village found.</CommandEmpty>
            <CommandGroup>
              {filteredData?.map((village) => (
                <CommandItem
                  key={village.villageCode}
                  value={getName(village)}
                  onSelect={() => {
                    onChangeSelected(village);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dataSelect?.villageCode === village.villageCode
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getName(village)}
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