const normalizeName = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

const IMAGE_MAP: Record<string, string> = {
  [normalizeName("riz bhalib")]: "riz-b-halib.webp",
};

export const getProductImage = (name: string): string => {
  const normalized = normalizeName(name);

  if (IMAGE_MAP[normalized]) {
    return `/images/${IMAGE_MAP[normalized]}`;
  }

  const slug = normalized.replace(/\s+/g, "-");
  return `/images/${slug}.webp`;
};
