import {
  Clock,
  Flame,
  Gamepad2,
  GraduationCap,
  History,
  Home,
  ListVideo,
  Music,
  Newspaper,
  PlaySquare,
  Radio,
  ShoppingBag,
  ThumbsUp,
  User,
} from "lucide-react";

export type Video = {
  id: string;
  title: string;
  channel: string;
  views: number;
  createdAt: string;
  duration: string;
  category: string;
  avatar: string;
  gradient: string;
  description: string;
};

export const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

export const sidebarItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Subscription", icon: PlaySquare, href: "/subscribe" },
  { label: "History", icon: History, href: "/history" },
  { label: "Liked videos", icon: ThumbsUp, href: "/liked-videos" },
  { label: "Watch later", icon: Clock, href: "/watch-later" },
  { label: "Your channel", icon: User, href: "/channel/1" },
];

export const exploreItems = [
  { label: "Trending", icon: Flame },
  { label: "Music", icon: Music },
  { label: "Live", icon: Radio },
  { label: "Gaming", icon: Gamepad2 },
  { label: "News", icon: Newspaper },
  { label: "Learning", icon: GraduationCap },
  { label: "Shopping", icon: ShoppingBag },
  { label: "Playlists", icon: ListVideo },
];

export const videos: Video[] = [
  {
    id: "nature-documentary",
    title: "Amazing Nature Documentary",
    channel: "Nature Channel",
    views: 45000,
    createdAt: new Date().toISOString(),
    duration: "10:24",
    category: "Science",
    avatar: "N",
    gradient: "from-emerald-700 via-lime-300 to-amber-200",
    description:
      "Enjoy beautiful views of nature and learn simple facts about plants, animals, and the world around us.",
  },
  {
    id: "perfect-pasta",
    title: "Cooking Tutorial: Perfect Pasta",
    channel: "Chef's Kitchen",
    views: 23000,
    createdAt: "2026-07-01T08:15:00.000Z",
    duration: "10:24",
    category: "Food",
    avatar: "C",
    gradient: "from-orange-700 via-amber-300 to-stone-100",
    description:
      "Learn how to make tasty pasta at home with easy steps and simple cooking tips.",
  },
  {
    id: "react-course",
    title: "React Basics: Components, Props and State",
    channel: "Code Desk",
    views: 128000,
    createdAt: "2026-06-30T10:30:00.000Z",
    duration: "18:42",
    category: "Education",
    avatar: "R",
    gradient: "from-sky-700 via-cyan-300 to-white",
    description:
      "A beginner-friendly lesson that explains React components, props, and state in a simple way.",
  },
  {
    id: "tailwind-layout",
    title: "Tailwind CSS Layout Tricks for Real Apps",
    channel: "Design Systems",
    views: 56000,
    createdAt: "2026-06-28T09:00:00.000Z",
    duration: "09:41",
    category: "Technology",
    avatar: "T",
    gradient: "from-zinc-900 via-violet-400 to-slate-100",
    description:
      "See useful Tailwind CSS layout ideas that can help you build clean app screens faster.",
  },
  {
    id: "travel-guide",
    title: "Japan Travel Guide: First Time in Tokyo",
    channel: "Travel Notes",
    views: 912000,
    createdAt: "2026-06-23T12:00:00.000Z",
    duration: "22:10",
    category: "Travel",
    avatar: "J",
    gradient: "from-rose-700 via-pink-300 to-indigo-100",
    description:
      "A simple travel guide for visiting Tokyo, with helpful places to see and easy tips for first-time visitors.",
  },
  {
    id: "gaming-highlights",
    title: "Best Gaming Highlights of the Week",
    channel: "Level Up",
    views: 340000,
    createdAt: "2026-06-20T14:45:00.000Z",
    duration: "14:03",
    category: "Gaming",
    avatar: "G",
    gradient: "from-purple-800 via-fuchsia-400 to-yellow-200",
    description:
      "Watch fun gaming moments, smart plays, and exciting highlights from this week.",
  },
  {
    id: "movie-review",
    title: "New Movie Review: What Worked and What Did Not",
    channel: "Cinema Room",
    views: 78000,
    createdAt: "2026-06-18T18:10:00.000Z",
    duration: "16:37",
    category: "Movies",
    avatar: "M",
    gradient: "from-neutral-950 via-red-500 to-orange-200",
    description:
      "A simple movie review that talks about the story, acting, and the best parts of the film.",
  },
  {
    id: "daily-news",
    title: "Morning News Roundup in 12 Minutes",
    channel: "Daily Bulletin",
    views: 214000,
    createdAt: "2026-07-01T06:00:00.000Z",
    duration: "12:00",
    category: "News",
    avatar: "D",
    gradient: "from-blue-950 via-blue-500 to-sky-100",
    description:
      "Catch up on the main news stories of the morning in a short and easy format.",
  },
];

export const likedVideos = [
  videos[2],
  videos[5],
  videos[7],
  videos[3],
];

export const watchLaterVideos = [
  videos[4],
  videos[1],
  videos[6],
  videos[0],
];

export function formatViews(views: number) {
  return views.toLocaleString("en-US");
}

export function formatDateToNow(date: string) {
  const created = new Date(date).getTime();
  const diffMs = Date.now() - created;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "less than a minute ago";
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
