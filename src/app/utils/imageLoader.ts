const normalizeName = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

const IMAGE_MAP: Record<string, string> = {
  [normalizeName("apple quinoa")]: "apple-quinoa.webp",
  [normalizeName("riz bhalib")]: "riz-b-halib.webp",
  [normalizeName("quinoa banana blueberry")]: "quinoa-berries.webp",
  [normalizeName("mhalabiye")]: "mhalabiye.webp",
  [normalizeName("salmon fingers")]: "salmon-fingers.webp",
  [normalizeName("beurre d amande")]: "beurredamande.webp",
  [normalizeName("beurre damande")]: "beurredamande.webp",
};

const CACHE_BUSTER = "?v=2";

export const getProductImage = (name: string): string => {
  const normalized = normalizeName(name);

  if (IMAGE_MAP[normalized]) {
    return `/images/${IMAGE_MAP[normalized]}${CACHE_BUSTER}`;
  }

  const slug = normalized.replace(/\s+/g, "-");
  return `/images/${slug}.webp${CACHE_BUSTER}`;
};
