import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 p-4">
            <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
                404
            </h1>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
                Page Not Found
            </h2>
            <p className="mt-2 text-neutral-400 text-center max-w-md">
                The page you are looking for does not exist or has been moved.
            </p>
            <div className="mt-8">
                <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                    <Link href="/dashboard">Return Home</Link>
                </Button>
            </div>
        </div>
    );
}
