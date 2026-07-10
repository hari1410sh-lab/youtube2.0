import {
  Bell,
  CircleUserRound,
  Menu,
  Mic,
  MoreVertical,
  Plus,
  Search,
  Upload,
  Video,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/lib/authcontext";

const navItems = ["Home", "Shorts", "Subscriptions", "Library"];

type HeaderUser = {
  name?: string | null;
  image?: string | null;
};

type UserContextValue = {
  user: HeaderUser | null;
  logout: () => void;
  handlegoogleSignIn: () => void;
};

export function Header() {
  const router = useRouter();
  const { user, logout, handlegoogleSignIn } = useUser() as UserContextValue;
  const [searchQuery, setSearchQuery] = useState(
    typeof router.query.q === "string" ? router.query.q : "",
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-left">
                <span className="flex size-8 items-center justify-center rounded-md bg-red-600 text-white">
                  <Video className="size-5 fill-current" />
                </span>
                YouTube
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 grid gap-1">
              {navItems.map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="justify-start text-sm font-medium"
                >
                  {item}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <a href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-red-600 text-white">
            <Video className="size-5 fill-current" />
          </span>
          <span className="hidden text-lg tracking-normal sm:inline">
            YouTube
          </span>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            IN
          </span>
        </a>

        <form
          onSubmit={handleSearch}
          className="mx-auto hidden w-full max-w-2xl items-center gap-2 md:flex"
        >
          <div className="flex min-w-0 flex-1 items-center">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-r-none border-r-0"
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-10 rounded-l-none border px-5"
              aria-label="Search"
            >
              <Search className="size-5" />
            </Button>
          </div>
          <Button variant="secondary" size="icon" aria-label="Voice search">
            <Mic className="size-5" />
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            asChild
          >
            <Link href="/search">
              <Search className="size-5" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Create">
                <Plus className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>
                <Upload className="size-4" />
                Upload video
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="size-4" />
                Go live
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>

          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? "/avatar.png"} alt={user.name ?? "User avatar"} />
                    <AvatarFallback>{user.name?.charAt(0) ?? "Y"}</AvatarFallback>
                  </Avatar>
                  <MoreVertical className="hidden size-4 sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.name ?? "My account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/channel/1">Your channel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>YouTube Studio</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-full border px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={handlegoogleSignIn}
            >
              <CircleUserRound className="size-5" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
