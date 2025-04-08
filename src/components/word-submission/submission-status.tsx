import { cn } from "@/lib/utils";

interface SubmissionStatusProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

const statusConfig = {
  pending: {
    label: "承認待ち",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "承認済み",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "却下",
    className: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

export function SubmissionStatus({ status, className }: SubmissionStatusProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-md border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}