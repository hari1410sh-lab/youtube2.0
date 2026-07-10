import { categories } from "@/lib/youtube-data";

export function CategoryTabs() {
  return (
    <div className="sticky top-16 z-40 border-b bg-background">
      <div className="flex gap-3 overflow-x-auto px-4 py-3">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`h-8 shrink-0 rounded-md px-4 text-sm font-medium transition-colors ${
              index === 0
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-zinc-200"
            }`}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;
