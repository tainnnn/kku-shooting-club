import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import Navbar from "./component/Navbar-admin";
import Announce from "./content/annouce-admin/page";

export default function Home() {
  return (
    <main className="w-full bg-white">
      <Announce/>
    </main>

  );
}
