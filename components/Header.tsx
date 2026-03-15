"use client"
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Header() {
    const { data: sessionData } = useSession();

    return (
        <header className="h-20 ">
            <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-10">

                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                    Parker Dashboard
                </Link>

                {sessionData ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700">
                            {sessionData.user?.name}
                        </span>
                        <button
                            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white  transition-colors hover:cursor-pointer"
                            onClick={
                                () => void signOut()

                            }
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">Guest</Badge>
                        <Link
                            href="/login"
                            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                        >
                            Sign in
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
