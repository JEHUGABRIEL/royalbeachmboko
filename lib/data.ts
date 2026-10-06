// Contenu du site. Les coordonnées, prix et dates d'événements sont des
// valeurs d'exemple à remplacer par les informations réelles du restaurant.

export const site = {
  name: "Royal Beach Mbocko",
  tagline: "Restaurant · Bar · Plage",
  location: "Mbocko, rive de l'Oubangui",
  country: "République centrafricaine",
  address: "Route de Mbocko, au bord de l'Oubangui, Bimbo — RCA",
  phone: "+236 00 00 00 00",
  whatsapp: "+236 00 00 00 00",
  email: "contact@royalbeachmbocko.cf",
  mapQuery: "Mbocko, Bimbo, Central African Republic",
  socials: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
  },
};

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "Le lieu" },
  { href: "/menu", label: "Menu" },
  { href: "/reservation", label: "Réservation" },
  { href: "/galerie", label: "Galerie" },
  { href: "/evenements", label: "Événements" },
  { href: "/contact", label: "Contact" },
];

export const hours = [
  { days: "Lundi — Vendredi", slots: ["10h — 15h (Déjeuner)", "18h — 23h (Dîner)"] },
  { days: "Samedi / Dimanche", slots: ["9h — 15h (Brunch & plage)", "17h — 1h (Dîner & soirée)"] },
];

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  tags: string[];
};

export type MenuCategory = { id: string; label: string; items: MenuItem[] };

export const menu: MenuCategory[] = [
  {
    id: "plats",
    label: "Plats",
    items: [
      { name: "Capitaine braisé de l'Oubangui", description: "Poisson entier mariné, braisé au feu de bois", price: 9000, tags: ["Spécialité", "Grillade"] },
      { name: "Poulet DG", description: "Poulet sauté, plantains mûrs, légumes frais", price: 7500, tags: ["Plat"] },
      { name: "Ngunza & gozo", description: "Feuilles de manioc pilées, pâte de manioc", price: 4500, oldPrice: 5000, tags: ["Tradition"] },
      { name: "Koko au poisson fumé", description: "Feuilles de koko, arachide, poisson fumé", price: 5000, tags: ["Tradition"] },
      { name: "Brochettes de bœuf", description: "Piment doux, oignons, frites de plantain", price: 6000, tags: ["Grillade"] },
      { name: "Gambas grillées", description: "Beurre ail-citron, riz parfumé", price: 12000, tags: ["Spécialité"] },
      { name: "Poulet braisé entier", description: "Mariné aux épices, attiéké ou frites", price: 10000, tags: ["À partager"] },
      { name: "Assiette végétarienne", description: "Légumes du marché, avocat, riz et haricots", price: 4000, tags: ["Végétarien"] },
    ],
  },
  {
    id: "boissons",
    label: "Boissons",
    items: [
      { name: "Bière locale 65 cl", description: "Bien fraîche, servie face au fleuve", price: 1500, tags: ["Bière"] },
      { name: "Jus de bissap", description: "Hibiscus, menthe, gingembre", price: 1000, tags: ["Maison"] },
      { name: "Jus de gingembre", description: "Pressé chaque matin", price: 1000, tags: ["Maison"] },
      { name: "Cocktail Royal Beach", description: "Rhum, mangue, passion, citron vert", price: 5000, oldPrice: 6000, tags: ["Cocktail"] },
      { name: "Mojito", description: "Rhum, menthe fraîche, citron vert", price: 4500, tags: ["Cocktail"] },
      { name: "Eau minérale 1,5 L", description: "Plate ou gazeuse", price: 1000, tags: ["Soft"] },
      { name: "Soda", description: "Sélection de sodas", price: 800, tags: ["Soft"] },
      { name: "Vin au verre", description: "Rouge, blanc ou rosé", price: 3500, tags: ["Vin"] },
    ],
  },
  {
    id: "dejeuner",
    label: "Déjeuner",
    items: [
      { name: "Formule du jour", description: "Entrée + plat + boisson", price: 7000, tags: ["Midi"] },
      { name: "Salade de l'Oubangui", description: "Avocat, tomates, œuf, poisson fumé", price: 4000, tags: ["Frais"] },
      { name: "Sandwich poulet braisé", description: "Pain croustillant, crudités, frites", price: 3500, tags: ["Rapide"] },
      { name: "Omelette garnie", description: "Oignons, tomates, frites ou plantain", price: 3000, tags: ["Rapide"] },
      { name: "Menu enfant", description: "Mini brochettes, frites, jus", price: 3000, tags: ["Enfants"] },
      { name: "Salade de fruits", description: "Mangue, ananas, papaye, banane", price: 2000, tags: ["Dessert"] },
    ],
  },
];

export const galleryCategories = ["Tous", "Fleuve", "Terrasses", "Intérieur", "Loisirs"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type Photo = { src: string; alt: string; category: Exclude<GalleryCategory, "Tous"> };

export const photos: Photo[] = [
  { src: "/images/vue-oubangui.jpg", alt: "Vue sur l'Oubangui depuis le jardin", category: "Fleuve" },
  { src: "/images/terrasse-parasols-1.jpg", alt: "Terrasse sous les parasols", category: "Terrasses" },
  { src: "/images/salle-panoramique.jpg", alt: "Salle panoramique face au fleuve", category: "Intérieur" },
  { src: "/images/kayak-oubangui.jpg", alt: "Kayak sur l'Oubangui", category: "Loisirs" },
  { src: "/images/plage-palmier.jpg", alt: "Plage et palmiers", category: "Fleuve" },
  { src: "/images/bar-comptoir.jpg", alt: "Le comptoir du bar", category: "Intérieur" },
  { src: "/images/aire-de-jeux-2.jpg", alt: "Aire de jeux pour enfants", category: "Loisirs" },
  { src: "/images/terrasse-pergola.jpg", alt: "Terrasse sous pergola", category: "Terrasses" },
  { src: "/images/ponton-oubangui.jpg", alt: "Ponton au bord du fleuve", category: "Fleuve" },
  { src: "/images/salon-rotin.jpg", alt: "Salon en rotin", category: "Intérieur" },
  { src: "/images/billard.jpg", alt: "Table de billard", category: "Loisirs" },
  { src: "/images/terrasse-vue-fleuve.jpg", alt: "Terrasse avec vue sur le fleuve", category: "Terrasses" },
  { src: "/images/passerelle-bois.jpg", alt: "Passerelle en bois", category: "Fleuve" },
  { src: "/images/salle-banquet.jpg", alt: "Salle de banquet", category: "Intérieur" },
  { src: "/images/tortue.jpg", alt: "La tortue du jardin", category: "Loisirs" },
  { src: "/images/terrasse-sable.jpg", alt: "Terrasse sur le sable", category: "Terrasses" },
  { src: "/images/ponton-detente.jpg", alt: "Ponton de détente", category: "Fleuve" },
  { src: "/images/fauteuil-oeuf.jpg", alt: "Fauteuil suspendu", category: "Intérieur" },
  { src: "/images/toboggan.jpg", alt: "Toboggan au bord de l'eau", category: "Loisirs" },
  { src: "/images/pergola-riviere.jpg", alt: "Pergola en bord de rivière", category: "Terrasses" },
  { src: "/images/biere-oubangui.jpg", alt: "Une bière fraîche face à l'Oubangui", category: "Fleuve" },
  { src: "/images/salle-evenement.jpg", alt: "Salle dressée pour un événement", category: "Intérieur" },
  { src: "/images/aire-de-jeux-1.jpg", alt: "Jeux sur le sable", category: "Loisirs" },
  { src: "/images/jardin-tropical.jpg", alt: "Jardin tropical", category: "Terrasses" },
];

export type EventItem = {
  slug: string;
  title: string;
  day: string;
  month: string;
  time: string;
  place: string;
  description: string;
  image: string;
};

export const events: EventItem[] = [
  {
    slug: "soiree-coucher-de-soleil",
    title: "Soirée coucher de soleil",
    day: "17",
    month: "Octobre",
    time: "17h00 — 23h00",
    place: "Ponton Royal Beach",
    description: "Cocktails, grillades et musique live face au soleil couchant sur l'Oubangui.",
    image: "/images/ponton-oubangui.jpg",
  },
  {
    slug: "dj-night",
    title: "DJ Night au bord du fleuve",
    day: "24",
    month: "Octobre",
    time: "20h00 — 2h00",
    place: "Terrasse principale",
    description: "Une nuit de sons afro, coupé-décalé et ndombolo jusqu'au bout de la nuit.",
    image: "/images/bar-violet.jpg",
  },
  {
    slug: "dimanche-en-famille",
    title: "Dimanche en famille",
    day: "1",
    month: "Novembre",
    time: "11h00 — 18h00",
    place: "Plage & aire de jeux",
    description: "Buffet braisé, animations pour enfants, kayak et détente sur le sable.",
    image: "/images/aire-de-jeux-2.jpg",
  },
];

export const testimonials = [
  {
    quote: "Le meilleur endroit pour un capitaine braisé avec les pieds presque dans l'Oubangui. Service chaleureux, cadre magnifique.",
    author: "Clarisse N.",
    role: "Cliente fidèle, Bangui",
  },
  {
    quote: "Nous y avons organisé notre mariage : la salle, la terrasse et l'équipe étaient parfaites. Nos invités en parlent encore.",
    author: "Serge & Aurélie",
    role: "Réception de mariage",
  },
  {
    quote: "Les enfants profitent de l'aire de jeux pendant qu'on se détend sous les parasols. Notre sortie préférée du dimanche.",
    author: "Famille Yakété",
    role: "Week-end en famille",
  },
];

export const formatPrice = (n: number) => `${n.toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;
