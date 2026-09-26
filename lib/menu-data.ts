export type MenuItem = {
  id: string;
  name: string;
  description: string;
  flavors: string[];
  sizes: { label: string; price?: string; contents?: string }[];
  minQuantity: number;
  quantityLabel: string;
  /** null shows imagePlaceholder until the photo is added. */
  image: string | null;
  imagePlaceholder?: string;
  alt: string;
  type: "standard" | "custom";
  flavorChoice: "single" | "none";
};

/** e.g. "2 dozen" for a minimum of 2 with quantity label "dozen". */
export function formatMinimum(minQuantity: number, quantityLabel: string): string {
  return [minQuantity, quantityLabel].filter(Boolean).join(" ");
}

export const menuItems: MenuItem[] = [
  {
    id: "mochi-cake",
    name: "Mochi Cake",
    description: "Soft, buttery, and delicately chewy, with a crispy golden edge.",
    flavors: ["Classic Butter", "Citrus Matcha", "Velvety Ube"],
    sizes: [
      { label: "Half dozen", price: "[PRICE]" },
      { label: "1 dozen", price: "[PRICE]" },
    ],
    minQuantity: 1,
    quantityLabel: "",
    image: "/images/Mochi_Cakes.JPG",
    alt: "Assorted mochi cakes with golden crispy edges",
    type: "standard",
    flavorChoice: "single",
  },
  {
    id: "mochi-maddies",
    name: "Mochi Maddies",
    description:
      "Our take on the classic madeleine. Crispy shell edges, tender chewy center.",
    flavors: ["Classic Butter"],
    sizes: [{ label: "1 dozen", price: "[PRICE]" }],
    minQuantity: 1,
    quantityLabel: "dozen",
    image: "/images/Maddies.JPG",
    alt: "Mochi Maddies madeleines with crispy shell edges",
    type: "standard",
    flavorChoice: "single",
  },
  {
    id: "mini-mochi-cupcakes",
    name: "Mini Mochi Cupcakes",
    description:
      "Assorted mini cupcakes in Classic Butter, Citrus Matcha, and Velvety Ube, each topped with a luxurious light buttercream that is not too sweet.",
    flavors: ["Assorted"],
    sizes: [{ label: "1 dozen", price: "[PRICE]" }],
    minQuantity: 2,
    quantityLabel: "dozen",
    image: "/images/Mini_Mochis.jpeg",
    alt: "Assorted mini mochi cupcakes topped with buttercream",
    type: "standard",
    flavorChoice: "none",
  },
  {
    id: "sampler",
    name: "The Sampler",
    description:
      "Try every flavor in one box: mochi cakes in Classic Butter, Citrus Matcha, and Velvety Ube, plus our Mochi Maddies.",
    flavors: [],
    sizes: [
      {
        label: "Full box",
        price: "[PRICE]",
        contents: "4 of each mochi cake flavor, plus 6 Mochi Maddies",
      },
      {
        label: "Half box",
        price: "[PRICE]",
        contents: "2 of each mochi cake flavor, plus 4 Mochi Maddies",
      },
    ],
    minQuantity: 1,
    quantityLabel: "",
    image: null,
    imagePlaceholder: "[SAMPLER PHOTO]",
    alt: "The Sampler box",
    type: "standard",
    flavorChoice: "none",
  },
];
