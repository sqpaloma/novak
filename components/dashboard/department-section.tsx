"use client";

import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";


interface MechanicItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    mechanics: string[];
      processedItems: any[];
    consultantName: string;
    teamList: string[];
  };
}

const MechanicItem = ({ index, style, data }: MechanicItemProps) => {
  const { mechanics, processedItems, consultantName, teamList } = data;
  const m = (mechanics || [])[index];
  if (!m) return null;

  const mechanicUpper = m.toUpperCase();
  const counts = {
    execCount: 0,
    overdueCount: 0,
  }



  return (
    <div style={style}>
      <li className="text-sm text-gray-700 flex items-center justify-between px-1">
        <span>{m}</span>
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
  processedItems: any[];
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





  return (
    <div>
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-300">
        <p className="text-xs text-gray-600 font-medium">{title}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-700 font-medium">
            {0}
          </span>
          <span className="text-red-600 font-semibold">
            {0}
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
            const counts = {
              execCount: 0,
              overdueCount: 0,
            }


            return (
              <li
                key={m}
                className="text-sm text-gray-700 flex items-center justify-between"
              >
                <span>{m}</span>
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