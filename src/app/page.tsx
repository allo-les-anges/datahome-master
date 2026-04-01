// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 text-center bg-white">
      <h1 className="text-4xl font-bold font-montserrat text-slate-900">HabiHub</h1>
      <p className="mt-4 text-lg text-slate-600">Plateforme de gestion immobilière</p>
      
      <div className="mt-12 p-8 border border-slate-100 rounded-2xl bg-slate-50 max-w-md w-full">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
          Test des Agences (Mode Path)
        </h2>
        <div className="flex flex-col gap-4">
          {/* Ce lien pointe vers le dossier src/app/agency/[slug]/page.tsx */}
          <a 
            href="/agency/amaru-homes" 
            className="px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            Voir l'agence Amaru Homes
          </a>
          
          <p className="text-[10px] text-slate-400 italic">
            Note : Sur Vercel Hobby, nous utilisons /agency/slug au lieu des sous-domaines.
          </p>
        </div>
      </div>
    </main>
  );
}
