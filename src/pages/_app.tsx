import "@/styles/globals.css";
import Header from "@/components/header";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/authcontext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Component {...pageProps} />
    </div>
    </UserProvider>
  );
}
