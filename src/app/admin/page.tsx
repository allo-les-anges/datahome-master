// Supprimez l'import de redirect
export default function AdminRoot() {
  // Au lieu de rediriger, on affiche simplement le contenu
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tableau de bord Administration</h1>
      <p className="text-slate-600">Bienvenue dans votre espace de gestion HabiHub.</p>
      {/* Vous pouvez ajouter ici vos composants de statistiques ou de raccourcis */}
    </div>
  );
}