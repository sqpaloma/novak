import { ProcessedItem } from "@/lib/types";
import { getDueDate } from "@/lib/programacao-utils";

interface ActivityCardProps {
  activity: ProcessedItem;
  onClick?: (activity: ProcessedItem) => void;
}

// Helper functions
function formatDueLabel(due: Date | null): { label: string; isOverdue: boolean } {
  if (!due) return { label: "Sem data", isOverdue: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(due);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: `Há ${Math.abs(diffDays)} dia(s)`, isOverdue: true };
  if (diffDays === 0) return { label: "Hoje", isOverdue: false };
  if (diffDays === 1) return { label: "Amanhã", isOverdue: false };
  return { label: `Em ${diffDays} dia(s)`, isOverdue: false };
}

function getCardStyle(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("analise") || s.includes("análise") || s.includes("revis")) {
    return "bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-400";
  }
  if (s.includes("execu")) {
    return "bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-400";
  }
  return "bg-gray-50 border border-gray-200 border-l-4 border-l-gray-400";
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const due = getDueDate(activity);
  const { label: dueLabel, isOverdue } = formatDueLabel(due);
  const titleFull = activity.titulo || activity.os;
  const clientFull = activity.cliente;
  const cardStyle = isOverdue
    ? "bg-red-50 border border-red-200 border-l-4 border-l-red-500"
    : getCardStyle(activity.status);

  return (
    <div
      className={`p-3 rounded-md cursor-pointer hover:shadow-md transition-shadow ${cardStyle}`}
      onClick={() => onClick?.(activity)}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
            {titleFull}
          </h4>
        </div>
        
        {clientFull && (
          <p className="text-xs text-gray-600 line-clamp-1">
            Cliente: {clientFull}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            OS: {activity.os}
            </span>
            <span
            className={`text-xs px-2 py-1 rounded ${
              isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
            >
              {dueLabel}
            </span>
          </div>
        
        <div className="text-xs text-gray-500">
          Status: {activity.status}
        </div>
      </div>
    </div>
  );
}