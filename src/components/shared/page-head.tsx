import { LucideIcon } from "lucide-react";

interface PropsType {
  title: string;
  icon: LucideIcon;
  description: string;
}

const PageHead = ({ title, icon: Icon, description = "" }: PropsType) => {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-3 ">
        <Icon className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <p className="text-sm text-gray-500 italic underline">{description}</p>
    </div>
  );
};

export default PageHead;
