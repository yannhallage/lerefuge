window.AppConfig = {
    // URL de base de ton backend (sans slash final), ex: https://api.mon-site.com
    // apiBaseUrl: "https://refuge-navy.vercel.app",
    apiBaseUrl: "http://localhost:3000/api",
    // Route HTTP reelle exposee par ton backend (avec slash initial)
    // Exemples: "/public/accueil", "/api/public/accueil"
    accueilPath: "/public/accueil",
    // Route HTTP pour recuperer tous les logements
    logementPath: "/public/logement",
    // Route HTTP pour recuperer toutes les images de la galerie
    galeriePath: "/public/galerie",
    // Route HTTP pour recuperer toutes les activites
    activitePath: "/public/activites",
    // Route HTTP pour recuperer toutes les images d'activites
    activiteImagePath: "/public/activites/images",
    // Route HTTP pour recuperer tous les plats de restauration
    restaurationPath: "/public/restauration"
};
