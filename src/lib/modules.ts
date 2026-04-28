export const MODULES = [
  {
    id: 'mini_crm',
    name: 'Mini CRM Leads',
    description: 'Gérez et suivez tous vos leads directement dans DATAhome. Historique des contacts, statuts, notes et relances automatiques.',
    price: 19,
    icon: 'Users',
    color: 'blue',
    benefits: [
      'Tableau de bord leads en temps réel',
      'Statuts : nouveau, en cours, converti',
      'Notes et historique par contact',
      'Export CSV',
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Connectez votre numéro WhatsApp Business pour recevoir les leads directement sur WhatsApp et augmenter votre taux de réponse.',
    price: 19,
    icon: 'MessageCircle',
    color: 'green',
    benefits: [
      'Bouton WhatsApp sur toutes les pages',
      'Notifications leads en temps réel',
      'Templates de réponse rapide',
      'Statistiques de contact',
    ],
  },
  {
    id: 'property_manager',
    name: 'Property Manager',
    description: 'Ajoutez et gérez vos propres biens manuellement, indépendamment du flux XML HabiHub.',
    price: 29,
    icon: 'Building2',
    color: 'blue',
    benefits: [
      'Ajout manuel de biens illimité',
      'Photos, plans, documents',
      'Gestion des statuts (disponible, vendu)',
      'Import/export Excel',
    ],
  },
  {
    id: 'seo',
    name: 'Module SEO',
    description: "Boostez la visibilité Google de votre site avec des rich snippets, un sitemap automatique et l'intégration GTM/GA4.",
    price: 29,
    icon: 'TrendingUp',
    color: 'teal',
    benefits: [
      'Schema.org RealEstateListing automatique',
      'Sitemap.xml généré dynamiquement',
      'Intégration GTM + GA4 + Meta Pixel',
      'Google Search Console simplifié',
    ],
  },
  {
    id: 'crm_sync',
    name: 'CRM Zoho / HubSpot',
    description: 'Synchronisez automatiquement vos leads DATAhome vers votre CRM existant (Zoho ou HubSpot).',
    price: 39,
    icon: 'Briefcase',
    color: 'purple',
    benefits: [
      'Sync automatique des leads',
      'Compatible Zoho CRM et HubSpot',
      'Mapping des champs personnalisable',
      'Logs de synchronisation',
    ],
  },
  {
    id: 'chatbot',
    name: 'Chatbot IA',
    description: 'Un assistant IA disponible 24h/24 qui qualifie vos visiteurs, répond à leurs questions et capture leurs coordonnées.',
    price: 49,
    icon: 'Bot',
    color: 'purple',
    benefits: [
      'Qualification automatique des leads',
      'Réponses en FR, NL, EN, ES, DE',
      'Personnalisé avec vos biens',
      'Handover vers agent humain',
    ],
  },
] as const;

export const PLANS = [
  {
    id: 'silver',
    name: 'Silver',
    price: 50,
    modules: ['site_web'],
    color: 'teal',
    description: 'Idéal pour démarrer',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 129,
    modules: ['site_web', 'mini_crm', 'whatsapp', 'chatbot', 'seo'],
    color: 'amber',
    savings: 56,
    recommended: true,
    description: 'Le plus populaire',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 179,
    modules: ['site_web', 'mini_crm', 'whatsapp', 'property_manager', 'seo', 'crm_sync', 'chatbot'],
    color: 'purple',
    savings: 55,
    description: 'Tout inclus',
  },
] as const;

export type ModuleId = (typeof MODULES)[number]['id'];
export type PlanId = (typeof PLANS)[number]['id'];
