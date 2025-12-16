import type { LucideIcon } from "lucide-react";

interface PropsType {
  title: string;
  icon: LucideIcon;
  description: string;
  total: number
}

const PageHead = ({ title, icon: Icon, description = "", total = 0 }: PropsType) => {
 

  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-3 ">
        <Icon className="w-6 h-6 text-gray-600" />
        <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
      </div>
      <p className="text-xs md:text-sm text-gray-500 italic underline">{description} 
        {/* {
          total > 0 && (
            <span className="font-semibold mx-2">{total + " " + title}</span>
          )
        } */}
      </p>
    </div>
  );
};

export default PageHead;
