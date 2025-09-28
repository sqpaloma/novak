import { useMemo } from "react";


interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface UseFilteredItemsProps {
  processedItems: any[];
  filteredByResponsavel: string | null;
  shouldForceOwn: boolean;
  user: User | null;
  isSpecialManager: boolean;
  isAdmin: boolean;
}

export const useFilteredItems = ({
  processedItems,
  filteredByResponsavel,
  shouldForceOwn,
  user,
  isSpecialManager,
  isAdmin,
}: UseFilteredItemsProps) => {
  return useMemo(() => {
    let base = processedItems || [];

    if (shouldForceOwn && user?.name) {
      const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
      base = (processedItems || []).filter((item) =>
        (item.responsavel || "").toString().toLowerCase().includes(ownFirstName)
      );
    }

    if (!shouldForceOwn && filteredByResponsavel) {
      base = base.filter(
        (item) => item.responsavel && item.responsavel.trim() === filteredByResponsavel
      );
    }

    if (
      !shouldForceOwn &&
      !filteredByResponsavel &&
      user?.name &&
      !isSpecialManager &&
      !isAdmin
    ) {
      const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
      base = base.filter((item) =>
        (item.responsavel || "").toString().toLowerCase().includes(ownFirstName)
      );
    }

    return base;
  }, [
    processedItems,
    filteredByResponsavel,
    shouldForceOwn,
    user?.name,
    user?.email,
    isSpecialManager,
    isAdmin,
  ]);
};