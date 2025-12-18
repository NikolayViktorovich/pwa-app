import MegaKabanCard from "@/components/MegaKabanCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black -z-10" />

      <header className="absolute top-6 left-0 w-full text-center">
        <h1 className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">
          REDD-PWA SYSTEM
        </h1>
      </header>

      <div className="z-10 w-full">
        <MegaKabanCard />
      </div>

      <footer className="absolute bottom-6 text-zinc-600 text-xs">
        v1.0.0 &bull; Early Access
      </footer>
    </main>
  );
}