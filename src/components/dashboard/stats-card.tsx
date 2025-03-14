import { ReactNode } from "react";

interface StatsCardProps {
  title: ReactNode;
  value: number;
  unit?: string;
  description?: string;
}

export function StatsCard({ title, value, unit, description }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {unit && (
          <p className="ml-2 text-sm font-medium text-gray-500">{unit}</p>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
