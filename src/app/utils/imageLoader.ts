const normalizeName = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

const IMAGE_MAP: Record<string, string> = {
  [normalizeName("apple quinoa")]: "apple-quinoa.webp",
  [normalizeName("chia berries")]: "chia-berries.webp",
  [normalizeName("coconut custard")]: "coconut-custard.webp",
  [normalizeName("riz b halib")]: "riz-b-halib.webp",
  [normalizeName("riz bhalib")]: "riz-b-halib.webp",
  [normalizeName("chia meghle")]: "chia-meghle.webp",
  [normalizeName("mhalabiye")]: "mhalabiye.webp",
  [normalizeName("quinoa banana blueberry")]: "quinoa-berries.webp",
  [normalizeName("quinoa berries")]: "quinoa-berries.webp",
  [normalizeName("sourdough biscuits")]: "sourdough-biscuits.webp",
  [normalizeName("almond pancakes")]: "almond-pancakes.webp",
  [normalizeName("chicken fingers")]: "chicken-fingers.webp",
  [normalizeName("lamb kebbe")]: "lamb-kebbe.webp",
  [normalizeName("salmon fingers")]: "salmon-fingers.webp",
  [normalizeName("cake")]: "cake.webp",
  [normalizeName("beurre d amande")]: "beurredamande.webp",
  [normalizeName("beurre damande")]: "beurredamande.webp",
  [normalizeName("beurre de cacahuettes")]: "beurre-de-cacahuettes.webp",
  [normalizeName("beurre de cajoux")]: "beurre-de-cajoux.webp",
  [normalizeName("choco noisettes")]: "choco-noisettes.webp",
  [normalizeName("baby knefeh")]: "baby-knefeh.webp",
  [normalizeName("oat cashew")]: "oat-cashew.webp",
};

export const getProductImage = (name: string): string => {
  const normalized = normalizeName(name);

  if (IMAGE_MAP[normalized]) {
    return `/images/${IMAGE_MAP[normalized]}`;
  }

  const slug = normalized.replace(/\s+/g, "-");
  return `/images/${slug}.webp`;
};
