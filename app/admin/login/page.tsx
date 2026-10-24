export default function AccessRequiredPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-navy px-4 py-8">
      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-ivory p-8 text-center shadow-2xl">
        <h1 className="font-display text-2xl">Admin</h1>
        <p className="text-sm text-slate">Open your private admin link to continue. If you don&apos;t have one, ask the organiser.</p>
      </div>
    </main>
  );
}
