"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
    const { data: sessionData } = useSession();
    const router = useRouter();

    return (
        <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                    Parker Dashboard
                </Link>


                {sessionData && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700">
                            {sessionData.user?.name}
                        </span>
                        <button
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            onClick={
                                () => void signOut()

                            }
                        >
                            登出
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
