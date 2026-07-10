import Link from "next/link";
import { useRouter } from "next/router";

import { sidebarItems } from "@/lib/youtube-data";

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="hidden w-40 shrink-0 border-r bg-background px-2 py-3 md:block lg:w-56">
      <nav className="grid gap-1">
        {sidebarItems.map(({ label, icon: Icon, href }) => {
          const active = router.pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className={`flex h-10 items-center gap-4 rounded-md px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="size-5" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
