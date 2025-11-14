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
// import { ProvinceModel } from "@/models/address/address.response";
// import { getAllProvinceService } from "@/services/address/address.service";
// import { debounce } from "@/utils/debounce/debounce";
// import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useState, useEffect, useCallback } from "react";
// import { useInView } from "react-intersection-observer";

// interface ComboboxSelectProvinceProps {
//   dataSelect: ProvinceModel | null;
//   onChangeSelected: (item: ProvinceModel) => void;
//   disabled?: boolean;
//   locale?: string;
// }

// export function ComboboxSelectProvince({
//   dataSelect,
//   onChangeSelected,
//   disabled = false,
//   locale = "en",
// }: ComboboxSelectProvinceProps) {
//   const [open, setOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [data, setData] = useState<ProvinceModel[]>([]);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // change language
//   const translate = useTranslations("common");

//   // Intersection Observer Hook
//   const { ref, inView } = useInView({ threshold: 1 });

//   const getName = (province: ProvinceModel) => {
//     return locale === "kh" ? province.provinceKh : province.provinceEn;
//   };

//   // Fetch data from API
//   const fetchData = async (search = "", newPage = 1) => {
//     if (loading || (lastPage && newPage > 1)) return;
//     setLoading(true);
//     try {
//       const result = await getAllProvinceService({
//         search,
//         pageSize: 10,
//         pageNo: newPage,
//       });
//       if (!result) {
//         console.error("No data returned from getAllProvinceService");
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
//       console.error("Error fetching provinces:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data on mount
//   useEffect(() => {
//     fetchData();
//   }, []);

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
//           {dataSelect ? getName(dataSelect) : "Select a province..."}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         className="w-[var(--radix-popover-trigger-width)] p-0"
//         align="start"
//       >
//         <Command>
//           <CommandInput
//             placeholder="Search province..."
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
//             <CommandEmpty>No province found.</CommandEmpty>
//             <CommandGroup>
//               {data?.map((item, index) => (
//                 <CommandItem
//                   key={item.provinceCode}
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
//                       dataSelect?.provinceCode === item.provinceCode ? "opacity-100" : "opacity-0"
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
import { ProvinceModel } from "@/models/address/address.response";
import { useTranslations } from "next-intl";

interface ComboboxSelectProvinceProps {
  dataSelect: ProvinceModel | null;
  onChangeSelected: (item: ProvinceModel | null) => void;
  disabled?: boolean;
  provinces: ProvinceModel[];
  isLoading?: boolean;
  locale?: string;
}

export function ComboboxSelectProvince({
  dataSelect,
  onChangeSelected,
  disabled = false,
  provinces,
  isLoading = false,
  locale = "en",
}: ComboboxSelectProvinceProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // change language
  const translate = useTranslations("common");

  const getName = (province: ProvinceModel) => {
    return locale === "kh" ? province.provinceKh : province.provinceEn;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return provinces;
    
    const lowerSearch = searchTerm.toLowerCase();
    return provinces.filter((province) =>
      getName(province).toLowerCase().includes(lowerSearch)
    );
  }, [provinces, searchTerm, locale]);

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
            : "Select a province..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search province..."
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
            <CommandEmpty>No province found.</CommandEmpty>
            <CommandGroup>
              {filteredData?.map((province) => (
                <CommandItem
                  key={province.provinceCode}
                  value={getName(province)}
                  onSelect={() => {
                    onChangeSelected(province);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dataSelect?.provinceCode === province.provinceCode
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getName(province)}
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