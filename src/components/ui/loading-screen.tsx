// components/ui/loading-screen.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingScreen() {
    return (
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-white">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-40 h-4 rounded-md" />
            <Skeleton className="w-24 h-4 rounded-md" />
        </div>
    );
}
