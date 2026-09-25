export type MenuItem = {
  id: string;
  name: string;
  description: string;
  flavors: string[];
  sizes: { label: string; price?: string }[];
  minQuantity: number;
  quantityLabel: string;
  image: string;
  alt: string;
  type: "standard" | "custom";
  flavorChoice: "single" | "none";
};

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
];
