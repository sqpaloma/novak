"use client";

import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { ProcessedItem } from "@/lib/types";
import { formatPersonName } from "@/lib/department-utils";
import { computeMechanicCounts, computeDepartmentTotals } from "@/lib/calculation-utils";

interface MechanicItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    mechanics: string[];
    processedItems: ProcessedItem[];
    consultantName: string;
    teamList: string[];
  };
}

const MechanicItem = ({ index, style, data }: MechanicItemProps) => {
  const { mechanics, processedItems, consultantName, teamList } = data;
  const m = (mechanics || [])[index];
  if (!m) return null;

  const mechanicUpper = m.toUpperCase();
  const counts = computeMechanicCounts(
    processedItems,
    consultantName,
    mechanicUpper,
    teamList
  );

  return (
    <div style={style}>
      <li className="text-sm text-gray-700 flex items-center justify-between px-1">
        <span>{formatPersonName(m)}</span>
        <span className="text-xs">
          <span className="text-gray-700 font-medium mr-2">
            {counts.execCount}
          </span>
          <span className="text-red-600 font-semibold">
            {counts.overdueCount}
          </span>
        </span>
      </li>
    </div>
  );
};

interface DepartmentSectionProps {
  title: string;
  mechanics: string[];
  processedItems: ProcessedItem[];
  consultantName: string;
  teamList: string[];
}

export const DepartmentSection = ({
  title,
  mechanics,
  processedItems,
  consultantName,
  teamList,
}: DepartmentSectionProps) => {
  const itemData = {
    mechanics,
    processedItems,
    consultantName,
    teamList,
  };

  const departmentTotals = computeDepartmentTotals(
    processedItems,
    consultantName,
    mechanics
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-300">
        <p className="text-xs text-gray-600 font-medium">{title}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-700 font-medium">
            {departmentTotals.totalExecCount}
          </span>
          <span className="text-red-600 font-semibold">
            {departmentTotals.totalOverdueCount}
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-0">
        {(mechanics || []).length > 5 ? (
          <div style={{ height: "120px", width: "100%" }}>
            <AutoSizer disableHeight>
              {({ width }: { width: number }) => (
                <List
                  height={120}
                  width={width}
                  itemCount={(mechanics || []).length}
                  itemSize={24}
                  itemData={itemData}
                >
                  {MechanicItem}
                </List>
              )}
            </AutoSizer>
          </div>
        ) : (
          (mechanics || []).map((m) => {
            const mechanicUpper = m.toUpperCase();
            const counts = computeMechanicCounts(
              processedItems,
              consultantName,
              mechanicUpper,
              teamList
            );
            return (
              <li
                key={m}
                className="text-sm text-gray-700 flex items-center justify-between"
              >
                <span>{formatPersonName(m)}</span>
                <span className="text-xs">
                  <span className="text-gray-700 font-medium mr-2">
                    {counts.execCount}
                  </span>
                  <span className="text-red-600 font-semibold">
                    {counts.overdueCount}
                  </span>
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};