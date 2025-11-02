import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full bg-white items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-black">
                Thank you for signing up!
              </CardTitle>
              <CardDescription className="text-md text-black px-1">Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-md text-black px-1">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-white text-base font-semibold shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] transition duration-300 hover:bg-green-600 disabled:opacity-60">
                <Link
                  href="/auth/login-condition"
                >Go to login page</Link>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
