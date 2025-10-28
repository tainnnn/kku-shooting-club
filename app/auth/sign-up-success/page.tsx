import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";6

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
