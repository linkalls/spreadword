import { providerMap, signIn } from "@/auth";
import { AuthError } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import iconPng from "../../../../public/icon.png";

const SIGNIN_ERROR_URL = "/auth/error";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Image
        src={iconPng}
        width={200}
        height={300}
        alt="logo"
        className="mx-auto mb-6"
      />
      {Object.values(providerMap).map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server";
            try {
              await signIn(provider.id, {
                redirectTo: "/dashboard",
              });
              // Server action cannot use client-side hooks
              // User state will be updated through session
            } catch (error) {
              // Signin can fail for a number of reasons, such as the user
              // not existing, or the user not having the correct role.
              // In some cases, you may want to redirect to a custom error
              if (error instanceof AuthError) {
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
              }

              // Otherwise if a redirects happens Next.js can handle it
              // so you can just re-thrown the error and let Next.js handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error;
            }
          }}
        >
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Sign in with {provider.name}
          </button>
        </form>
      ))}
    </div>
  );
}