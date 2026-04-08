export interface ProductData {
  Item_code: string;
  Category: string;
  Item: string;
  Size: string;
  Texture: string;
  Unit_Price: string;
  Ingredients?: string;
}

export const PRODUCTS: ProductData[] = [
  // ── PUDDING ──────────────────────────────────────────────────────────────
  { Item_code: "apple quinoa",       Category: "Pudding",     Item: "Apple Quinoa",              Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "quinoa, orange water, qapples" },
  { Item_code: "apple quinoa",       Category: "Pudding",     Item: "Apple Quinoa",              Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "quinoa, orange water, qapples" },
  { Item_code: "chia berries",       Category: "Pudding",     Item: "Chia Berries",              Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "milk, chia seeds, banana, berries, oats" },
  { Item_code: "chia berries",       Category: "Pudding",     Item: "Chia Berries",              Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "milk, chia seeds, banana, berries, oats" },
  { Item_code: "coconut custard",    Category: "Pudding",     Item: "Coconut Custard",           Size: "Big",   Texture: "",            Unit_Price: "6",   Ingredients: "semolina, coconut oil, banana, coconut milk" },
  { Item_code: "coconut custard",    Category: "Pudding",     Item: "Coconut Custard",           Size: "Small", Texture: "",            Unit_Price: "4",   Ingredients: "semolina, coconut oil, banana, coconut milk" },
  { Item_code: "riz bhalib",         Category: "Pudding",     Item: "Riz Bhalib",                Size: "Big",   Texture: "",            Unit_Price: "5",   Ingredients: "rice, milk, dates, rose water, orange water" },
  { Item_code: "riz bhalib",         Category: "Pudding",     Item: "Riz Bhalib",                Size: "Small", Texture: "",            Unit_Price: "3.5", Ingredients: "rice, milk, dates, rose water, orange water" },
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
  // Okra Stew With Chicken
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  { Item_code: "Okra Stew with Chicken", Category: "Platter", Item: "Okra Stew With Chicken",   Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, okra, chicken, pepper, tomatoes" },
  // Red Lentils Soup
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Big",    Texture: "Fully Blended", Unit_Price: "5",   Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Big",    Texture: "Half Blended",  Unit_Price: "5",   Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Big",    Texture: "Pieces",        Unit_Price: "5",   Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Small",  Texture: "Fully Blended", Unit_Price: "3.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Small",  Texture: "Half Blended",  Unit_Price: "3.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Small",  Texture: "Pieces",        Unit_Price: "3.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  { Item_code: "Red Lentils Soup",   Category: "Platter",     Item: "Red Lentils Soup",          Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, tomatoes, carrots, potatoes, red lentils" },
  // Roast Meat With Veggies
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  { Item_code: "Roast Meat with Veggies", Category: "Platter", Item: "Roast Meat With Veggies", Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, tomatoes, lamb, carrots, potatoes" },
  // Sweet Potato Salmon
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  { Item_code: "Sweet Potato Salmon", Category: "Platter",    Item: "Sweet Potato Salmon",       Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "olive oil, onions, garlic, pepper, potatoes, bell pepper, salmon, sweet potato" },
  // Beetroot Bowl
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Big",    Texture: "Fully Blended", Unit_Price: "5",   Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Big",    Texture: "Half Blended",  Unit_Price: "5",   Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Big",    Texture: "Pieces",        Unit_Price: "5",   Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Small",  Texture: "Fully Blended", Unit_Price: "3.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Small",  Texture: "Half Blended",  Unit_Price: "3.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Small",  Texture: "Pieces",        Unit_Price: "3.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  { Item_code: "Beetroot Bowl",      Category: "Platter",     Item: "Beetroot Bowl",             Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, lemon, carrots, beetroot, potatoes" },
  // Bone Soup
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Big",    Texture: "Fully Blended", Unit_Price: "7",   Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Big",    Texture: "Half Blended",  Unit_Price: "7",   Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Big",    Texture: "Pieces",        Unit_Price: "7",   Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Small",  Texture: "Fully Blended", Unit_Price: "4.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Small",  Texture: "Half Blended",  Unit_Price: "4.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Small",  Texture: "Pieces",        Unit_Price: "4.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Medium", Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Medium", Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  { Item_code: "Bone Soup",          Category: "Platter",     Item: "Bone Soup",                 Size: "Medium", Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, onions, pepper, tomatoes, carrots, potatoes, zucchini" },
  // Spinach Stew With Meat
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  { Item_code: "Spinach Stew with Meat", Category: "Platter", Item: "Spinach Stew With Meat",   Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "rice, olive oil, lemon, onions, garlic, coriander, lamb, spinach" },
  // Wild Pollock Fish Pasta
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  { Item_code: "Platter Wild Pollock Fish Pasta", Category: "Platter", Item: "Platter Wild Pollock Fish Pasta", Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, pepper, tomatoes, bell pepper, fish, pasta" },
  // Organic Chicken Liver
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Big",    Texture: "Fully Blended", Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Big",    Texture: "Half Blended",  Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Big",    Texture: "Pieces",        Unit_Price: "8",   Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Small",  Texture: "Fully Blended", Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Small",  Texture: "Half Blended",  Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Small",  Texture: "Pieces",        Unit_Price: "5.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Medium", Texture: "Fully Blended", Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Medium", Texture: "Half Blended",  Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },
  { Item_code: "Organic Chicken Liver", Category: "Platter",  Item: "Organic Chicken Liver",     Size: "Medium", Texture: "Pieces",        Unit_Price: "7.5", Ingredients: "olive oil, lemon, onions, garlic, coriander, pepper, chicken liver" },

  // ── NUT BUTTER ────────────────────────────────────────────────────────────
  // (placeholder — add items here when available)
];
