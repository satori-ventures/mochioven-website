export type MenuItem = {
  id: string;
  name: string;
  description: string;
  flavors: string[];
  sizes: { label: string; contents?: string }[];
  minQuantity: number;
  quantityLabel: string;
  /** null shows imagePlaceholder until the photo is added. */
  image: string | null;
  /** Pixel size of `image`, passed to next/image. */
  imageWidth?: number;
  imageHeight?: number;
  imagePlaceholder?: string;
  /** Small caption shown under the photo. */
  imageCaption?: string;
  alt: string;
  type: "standard" | "custom";
  flavorChoice: "single" | "none";
  /**
   * An optional extra for one flavor, e.g. toasted almonds on Classic Butter.
   * `flavor` is the cart and catalog flavor name when the extra is chosen.
   */
  flavorOption?: {
    baseFlavor: string;
    plainLabel: string;
    label: string;
    flavor: string;
    note: string;
  };
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
      { label: "Half dozen" },
      { label: "1 dozen" },
    ],
    minQuantity: 1,
    quantityLabel: "",
    image: "/images/mochi-cake.webp",
    imageWidth: 1536,
    imageHeight: 1024,
    alt: "A golden mochi cake with a crisp edge, topped with sliced almonds and powdered sugar, held in one hand",
    imageCaption: "Shown with optional toasted almonds.",
    type: "standard",
    flavorChoice: "single",
    flavorOption: {
      baseFlavor: "Classic Butter",
      plainLabel: "Plain",
      label: "Toasted almonds",
      flavor: "Classic Butter with Toasted Almonds",
      note: "Contains almonds",
    },
  },
  {
    id: "mochi-maddies",
    name: "Mochi Maddies",
    description:
      "Our take on the classic madeleine. Crispy shell edges, tender chewy center.",
    flavors: ["Classic Butter"],
    sizes: [{ label: "1 dozen" }],
    minQuantity: 1,
    quantityLabel: "dozen",
    image: "/images/Maddies.JPG",
    imageWidth: 2048,
    imageHeight: 1536,
    alt: "A row of Mochi Maddies madeleines dusted with powdered sugar on a white tray",
    type: "standard",
    flavorChoice: "single",
  },
  {
    id: "mini-mochi-cupcakes",
    name: "Mini Mochi Cupcakes",
    description:
      "Assorted mini cupcakes in Classic Butter, Citrus Matcha, and Velvety Ube, each topped with a luxurious light buttercream that is not too sweet.",
    flavors: ["Assorted"],
    sizes: [{ label: "1 dozen" }],
    minQuantity: 2,
    quantityLabel: "dozen",
    image: "/images/Mini_Mochis.jpeg",
    imageWidth: 1536,
    imageHeight: 2048,
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
        contents: "4 of each mochi cake flavor, plus 6 Mochi Maddies",
      },
      {
        label: "Half box",
        contents: "2 of each mochi cake flavor, plus 4 Mochi Maddies",
      },
    ],
    minQuantity: 1,
    quantityLabel: "",
    image: "/images/the-sampler.jpg",
    imageWidth: 1536,
    imageHeight: 1399,
    alt: "An open box of assorted mochi cakes and Mochi Maddies",
    type: "standard",
    flavorChoice: "none",
  },
];

// Square catalog naming: item names match `name` above exactly, and variation
// names are "{Flavor} - {Size}". Items without a flavor choice use "Assorted".
const CATALOG_ASSORTED_FLAVOR = "Assorted";

export type MenuVariant = {
  item: MenuItem;
  /** The flavor value the cart uses ("" when the item has no flavor). */
  flavor: string;
  size: string;
  catalogVariationName: string;
};

/** Every orderable item, flavor, and size combination. */
export function menuVariants(): MenuVariant[] {
  return menuItems.flatMap((item) => {
    const flavors =
      item.flavorChoice === "single"
        ? [...item.flavors, ...(item.flavorOption ? [item.flavorOption.flavor] : [])]
        : [item.flavors[0] ?? ""];
    return flavors.flatMap((flavor) =>
      item.sizes.map((size) => ({
        item,
        flavor,
        size: size.label,
        catalogVariationName: `${
          item.flavorChoice === "single" ? flavor : CATALOG_ASSORTED_FLAVOR
        } - ${size.label}`,
      }))
    );
  });
}

export function findMenuVariant(
  itemId: string,
  flavor: string,
  size: string
): MenuVariant | undefined {
  return menuVariants().find(
    (v) => v.item.id === itemId && v.flavor === flavor && v.size === size
  );
}

/** Key for looking up a price for one item, flavor, and size. */
export function priceKey(itemId: string, flavor: string, size: string): string {
  return `${itemId}|${flavor}|${size}`;
}

/**
 * Normalizes a catalog name for matching: ignores letter case, extra spaces,
 * and the dash type (hyphen, en dash, em dash, and similar).
 */
export function normalizeCatalogName(name: string): string {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‐-―−﹘﹣－-]/g, "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}
