import { Suspense } from "react";
import PriceCalendarApp from "./components/PriceCalendarApp";

function LoadingShell() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm">Loading application...</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <PriceCalendarApp />
    </Suspense>
  );
}
