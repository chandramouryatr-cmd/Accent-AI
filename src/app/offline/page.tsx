import Link from "next/link";

export const metadata = {
  title: "Offline — AccentAI",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[var(--bg)]">
      <div className="text-6xl mb-4">📵</div>
      <h1 className="font-d text-2xl font-bold text-[var(--t1)] mb-2">
        You&rsquo;re offline
      </h1>
      <p className="text-sm text-[var(--t2)] max-w-xs mb-6">
        AccentAI needs a connection the first time you open a lesson. Once
        you&rsquo;ve visited a page, it&rsquo;ll work offline.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-[var(--p)] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition"
      >
        Try again
      </Link>
    </main>
  );
}
