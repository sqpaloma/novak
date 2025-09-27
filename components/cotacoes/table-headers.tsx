import React from "react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, Filter } from "lucide-react";
import { SortConfig } from "./table-utils";

interface SortableHeaderProps {
  column: string;
  children: React.ReactNode;
  className?: string;
  textAlign?: "left" | "center" | "right";
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export const SortableHeader = ({
  column,
  children,
  className = "",
  textAlign = "left",
  sortConfig,
  onSort
}: SortableHeaderProps) => {
  const getSortIcon = () => {
    if (sortConfig.key === column) {
      if (sortConfig.direction === 'asc') {
        return <ChevronUp className="h-4 w-4" />;
      } else if (sortConfig.direction === 'desc') {
        return <ChevronDown className="h-4 w-4" />;
      }
    }
    return <ChevronUp className="h-4 w-4 opacity-30" />;
  };

  const textAlignClass = textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "";

  return (
    <TableHead
      className={`text-white cursor-pointer hover:bg-white/10 transition-colors ${textAlignClass} ${className}`}
      onClick={() => onSort(column)}
    >
      <div className={`flex items-center gap-1 ${textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : ""}`}>
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};

interface FilterableHeaderProps {
  column: string;
  children: React.ReactNode;
  className?: string;
  options: { value: string; label: string }[];
  currentValue: string;
  onValueChange: (value: string) => void;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export const FilterableHeader = ({
  column,
  children,
  className = "",
  options,
  currentValue,
  onValueChange,
  sortConfig,
  onSort
}: FilterableHeaderProps) => {
  const getSortIcon = () => {
    if (sortConfig.key === column) {
      if (sortConfig.direction === 'asc') {
        return <ChevronUp className="h-4 w-4" />;
      } else if (sortConfig.direction === 'desc') {
        return <ChevronDown className="h-4 w-4" />;
      }
    }
    return <ChevronUp className="h-4 w-4 opacity-30" />;
  };

  return (
    <TableHead className={`text-white ${className}`}>
      <div className="flex items-center gap-1">
        <div
          className="flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors px-1 py-1 rounded"
          onClick={() => onSort(column)}
        >
          {children}
          {getSortIcon()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/10">
              <Filter className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-blue-800 border-blue-600">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onValueChange(option.value)}
                className={`text-blue-100 hover:bg-blue-700 ${
                  currentValue === option.value ? "bg-blue-700" : ""
                }`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
};