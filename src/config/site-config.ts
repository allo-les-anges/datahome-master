// src/config/site-config.ts

export const SiteConfig = {
  // Identité
  agencyName: "Immo Habihub Demo",
  logoUrl: "/logo.png", 
  
  // Configuration du Hero (L'erreur venait du manque de cet objet)
  hero: {
    title: "Vivez l'exception immobilière",
    subtitle: "Découvrez notre sélection exclusive de biens de prestige.",
    backgroundImage: "/hero-bg.jpg",
  },

  // Personnalisation visuelle
  theme: {
    primaryColor: "#10b981", 
  },

  // Footer & Contact
  contact: {
    address: "Rue de la Loi 1, 1000 Bruxelles",
    phone: "+32 2 000 00 00",
    email: "info@agence-demo.be",
    facebook: "https://facebook.com/...",
  },

  // Le flux XML fourni par Habihub
  xmlEndpoint: "https://api.habihub.com/v1/client-xyz.xml"
};