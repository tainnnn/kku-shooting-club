import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import Navbar from "./component/Navbar-admin";
import Announce from "./content/annouce-admin/page";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <Announce/>
    </main>

  );
}
