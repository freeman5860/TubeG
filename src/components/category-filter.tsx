"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  _count?: { topics: number };
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onChange(null)}>
        <Badge
          variant={selected === null ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-colors",
            selected === null && "bg-primary text-primary-foreground"
          )}
        >
          全部
        </Badge>
      </button>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => onChange(cat.id)}>
          <Badge
            variant={selected === cat.id ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selected === cat.id && "bg-primary text-primary-foreground"
            )}
          >
            {cat.name}
            {cat._count && (
              <span className="ml-1 opacity-70">{cat._count.topics}</span>
            )}
          </Badge>
        </button>
      ))}
    </div>
  );
}
