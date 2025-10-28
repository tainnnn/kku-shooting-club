import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Announce from "./content/announce/page";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <Navbar />
      <Announce/>
    </main>

  );
}
