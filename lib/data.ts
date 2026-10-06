// Constantes du site qui ne changent pas. Le contenu modifiable (menu,
// événements, photos, coordonnées…) est en base et se gère dans /admin.

export const site = {
  name: "Royal Beach Mbocko",
  tagline: "Restaurant · Bar · Plage",
  country: "République centrafricaine",
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

export const galleryCategories = ["Tous", "Fleuve", "Terrasses", "Intérieur", "Loisirs"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type Photo = { src: string; alt: string; category: Exclude<GalleryCategory, "Tous"> };

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  tags: string[];
};

export type MenuCategory = { id: string; label: string; items: MenuItem[] };

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

export const formatPrice = (n: number) => `${n.toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;
