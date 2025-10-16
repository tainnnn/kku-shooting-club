import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    // <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white bg-text-black text-black">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
