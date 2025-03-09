import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
}: DashboardStatCardProps) {
  return (
    <div className="flex items-center rounded-xl bg-white p-4 shadow">
      <div
        className={`mr-4 rounded-full bg-${iconColor.toLocaleLowerCase()}-100 p-3`}
      >
        <Icon
          size={24}
          className={`text-${iconColor.toLocaleLowerCase()}-600`}
        />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
