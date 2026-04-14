export interface ProductData {
  Item_code: string;
  Category: string;
  Item: string;
  Size: string;
  Texture: string;
  Unit_Price: string;
  Ingredients?: string;
  "Size (ml)"?: string;
  Size_ml?: string;
  Delivery_Day?: string;
}

export const PRODUCTS: ProductData[] = [
  // ── PUDDING ──────────────────────────────────────────────────────────────
  { Item_code: "apple quinoa",       Category: "Pudding",     Item: "Apple Quinoa",              Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "quinoa, orange water, qapples", Size_ml: "240" },
  { Item_code: "apple quinoa",       Category: "Pudding",     Item: "Apple Quinoa",              Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "quinoa, orange water, qapples", Size_ml: "120" },
  { Item_code: "chia berries",       Category: "Pudding",     Item: "Chia Berries",              Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "milk, chia seeds, banana, berries, oats" },
  { Item_code: "chia berries",       Category: "Pudding",     Item: "Chia Berries",              Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "milk, chia seeds, banana, berries, oats" },
  { Item_code: "coconut custard",    Category: "Pudding",     Item: "Coconut Custard",           Size: "Big",   Texture: "",            Unit_Price: "6",   Ingredients: "semolina, coconut oil, banana, coconut milk" },
  { Item_code: "coconut custard",    Category: "Pudding",     Item: "Coconut Custard",           Size: "Small", Texture: "",            Unit_Price: "4",   Ingredients: "semolina, coconut oil, banana, coconut milk" },
  { Item_code: "riz bhalib",         Category: "Pudding",     Item: "Riz B Halib",               Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "rice, milk, dates, rose water, orange water" },
  { Item_code: "riz bhalib",         Category: "Pudding",     Item: "Riz B Halib",               Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "rice, milk, dates, rose water, orange water" },
  { Item_code: "chia meghle",        Category: "Pudding",     Item: "Chia Meghle",               Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "pepper, semolina, chia seeds, dates" },
  { Item_code: "chia meghle",        Category: "Pudding",     Item: "Chia Meghle",               Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "pepper, semolina, chia seeds, dates" },
  { Item_code: "mhalabiye",          Category: "Pudding",     Item: "Mhalabiye",                 Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "milk, semolina, dates, rose water, orange water" },
  { Item_code: "mhalabiye",          Category: "Pudding",     Item: "Mhalabiye",                 Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "milk, semolina, dates, rose water, orange water" },
  { Item_code: "quinoa banana blueberry", Category: "Pudding", Item: "Quinoa Banana Blueberry",  Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "" },
  { Item_code: "quinoa banana blueberry", Category: "Pudding", Item: "Quinoa Banana Blueberry",  Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "" },

  // ── BISCUIT ──────────────────────────────────────────────────────────────
  { Item_code: "sourdough biscuits", Category: "Biscuit",     Item: "Sourdough Biscuits",        Size: "Box",   Texture: "",            Unit_Price: "5.5", Ingredients: "butter, semolina, dates, rose water, orange water" },

  // ── FINGER FOOD ──────────────────────────────────────────────────────────
  { Item_code: "almond pancakes",    Category: "Finger Food", Item: "Almond Pancakes",           Size: "Box",   Texture: "",            Unit_Price: "9",   Ingredients: "oat flour, almond flour, chia seeds, eggs, coconut oil, banana" },
  { Item_code: "chicken fingers",    Category: "Finger Food", Item: "Chicken Fingers",           Size: "Box",   Texture: "",            Unit_Price: "15",  Ingredients: "olive oil, onions, pepper, potatoes, chicken breast" },
  { Item_code: "lamb kebbe",         Category: "Finger Food", Item: "Lamb Kebbe",                Size: "Box",   Texture: "",            Unit_Price: "10",  Ingredients: "olive oil, lamb" },
  { Item_code: "salmon fingers",     Category: "Finger Food", Item: "Salmon Fingers",            Size: "Box",   Texture: "",            Unit_Price: "15",  Ingredients: "olive oil, onions, pepper, potatoes, salmon" },
  { Item_code: "cake",               Category: "Finger Food", Item: "Cake",                      Size: "Piece", Texture: "Pieces",      Unit_Price: "6",   Ingredients: "dates, oat flour, eggs, coconut oil, vanilla, baking powder" },

  // ── PLATTER ───────────────────────────────────────────────────────────────
  // Tuesday platters
  // Bazella With Meat
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Bazella with Meat",    Category: "Platter", Item: "Bazella With Meat",           Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  // Burghol 3A Banadoura
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Big",    Texture: "Fully Blended", Unit_Price: "5",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Big",    Texture: "Half Blended",  Unit_Price: "5",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Big",    Texture: "Pieces",        Unit_Price: "5",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Small",  Texture: "Fully Blended", Unit_Price: "3.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Small",  Texture: "Half Blended",  Unit_Price: "3.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Small",  Texture: "Pieces",        Unit_Price: "3.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Burghol 3a banadoura", Category: "Platter", Item: "Burghol 3A Banadoura",        Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  // Chicken Soup
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Big",    Texture: "Fully Blended", Unit_Price: "7",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Big",    Texture: "Half Blended",  Unit_Price: "7",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Big",    Texture: "Pieces",        Unit_Price: "7",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Small",  Texture: "Fully Blended", Unit_Price: "4.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Small",  Texture: "Half Blended",  Unit_Price: "4.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Small",  Texture: "Pieces",        Unit_Price: "4.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Chicken Soup",         Category: "Platter", Item: "Chicken Soup",                Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  // Quinoa Salmon
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Delivery_Day: "Tuesday", Size_ml: "240" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Tuesday", Size_ml: "120" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  { Item_code: "Quinoa Salmon",        Category: "Platter", Item: "Quinoa Salmon",               Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Delivery_Day: "Tuesday", Size_ml: "200" },
  // Friday platters
  // Lemon Lentice Soup
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Big",    Texture: "Fully Blended", Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Big",    Texture: "Half Blended",  Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Big",    Texture: "Pieces",        Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Small",  Texture: "Fully Blended", Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Small",  Texture: "Half Blended",  Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Small",  Texture: "Pieces",        Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Lemon Lentice Soup",   Category: "Platter", Item: "Lemon Lentice Soup",          Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },
  // Moghrabieh
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Moghrabieh",           Category: "Platter", Item: "Moghrabieh",                  Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  // Siyadiyeh
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Siyadiyeh",            Category: "Platter", Item: "Siyadiyeh",                   Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  // Sweet Potato Kafta
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Sweet Potato Kafta",   Category: "Platter", Item: "Sweet Potato Kafta",          Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Delivery_Day: "Friday", Size_ml: "200" },
  // Veggie Soup
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Big",    Texture: "Fully Blended", Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Big",    Texture: "Half Blended",  Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Big",    Texture: "Pieces",        Unit_Price: "5",   Delivery_Day: "Friday", Size_ml: "240" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Small",  Texture: "Fully Blended", Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Small",  Texture: "Half Blended",  Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Small",  Texture: "Pieces",        Unit_Price: "3.5", Delivery_Day: "Friday", Size_ml: "120" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },
  { Item_code: "Veggie Soup",          Category: "Platter", Item: "Veggie Soup",                 Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Delivery_Day: "Friday", Size_ml: "200" },

  // ── NUT BUTTER ────────────────────────────────────────────────────────────
  // (placeholder — add items here when available)
];
