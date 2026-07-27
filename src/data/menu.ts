// OHHO BURGERS menu data — sourced from www.ohhofoods.com research dossier
// Real product names, descriptions, and ingredient tags from the live site.

export type MenuItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  image: string;
  category: "Burgers" | "Sandwiches" | "Pizzas" | "Snacks" | "Shakes";
  price: number; // INR — added for ordering (not on source site)
  kcal: number;
  prepTime: string;
  spice: 1 | 2 | 3;
  tag?: string;
  audioDescription: string; // for audio-guide section
};

export const menuItems: MenuItem[] = [
  {
    id: "chicken-cheese-burst",
    name: "Chicken Cheese Burst Burger",
    emoji: "🍗",
    description:
      "Crispy golden chicken patty with a molten cheese-filled center, fresh veggies, and signature sauce on a toasted bun.",
    ingredients: ["Chicken Patty", "Molten Cheese", "Fresh Veggies", "Signature Sauce", "Toasted Bun"],
    image: "https://www.ohhofoods.com/assets/Chicken%20Cheese%20Burst%20Burger-DhGOasXV.jpeg",
    category: "Burgers",
    price: 169,
    kcal: 612,
    prepTime: "7 min",
    spice: 2,
    tag: "Bestseller",
    audioDescription:
      "The Chicken Cheese Burst Burger. A crispy golden chicken patty with a molten cheese-filled center, fresh veggies, and our signature sauce on a toasted bun. Pure indulgence, sealed in every bite.",
  },
  {
    id: "ohho-special-chicken-burger",
    name: "OHHO Special Chicken Burger",
    emoji: "🔥",
    description:
      "Double-stacked, succulent fried chicken thighs layered with a rich cheese blend, premium mayo, tomato, lettuce, and onions.",
    ingredients: ["Double Chicken Thighs", "Cheese Blend", "Premium Mayo", "Tomato", "Lettuce", "Onions"],
    image: "https://www.ohhofoods.com/assets/OHHO%20Special%20Chicken%20Burger-BQo3y2S1.jpeg",
    category: "Burgers",
    price: 219,
    kcal: 824,
    prepTime: "9 min",
    spice: 3,
    tag: "Signature",
    audioDescription:
      "The OHHO Special Chicken Burger. Double-stacked succulent fried chicken thighs, layered with a rich cheese blend, premium mayo, fresh tomato, lettuce and onions. Our flagship — built for serious appetites.",
  },
  {
    id: "crispy-coated-chicken-burger",
    name: "Crispy Coated Chicken Burger",
    emoji: "😋",
    description:
      "A crispy-coated chicken burger stacked with fresh veggies and gooey melted cheese on a sesame seed bun.",
    ingredients: ["Crispy Chicken", "Melted Cheese", "Fresh Veggies", "Sesame Bun"],
    image: "https://www.ohhofoods.com/assets/crispy-coated%20chicken%20burger-DwJ58W-g.jpeg",
    category: "Burgers",
    price: 159,
    kcal: 568,
    prepTime: "6 min",
    spice: 1,
    audioDescription:
      "The Crispy Coated Chicken Burger. A perfectly crispy-coated chicken patty stacked with fresh veggies and gooey melted cheese on a toasted sesame bun. Crunch in every single bite.",
  },
  {
    id: "chicken-club-sandwich",
    name: "Chicken Club Sandwich",
    emoji: "🍞",
    description:
      "Layers of succulent grilled chicken, melted cheddar, and crisp veggies on toasted sourdough.",
    ingredients: ["Grilled Chicken", "Cheddar Cheese", "Crisp Veggies", "Toasted Sourdough"],
    image: "https://www.ohhofoods.com/assets/Chicken%20Club%20Sandwich-oiIfKLp6.jpeg",
    category: "Sandwiches",
    price: 149,
    kcal: 482,
    prepTime: "6 min",
    spice: 1,
    audioDescription:
      "The Chicken Club Sandwich. Layers of succulent grilled chicken, melted cheddar, and crisp vegetables on toasted sourdough. A classic — perfected.",
  },
  {
    id: "ohho-special-chicken-sandwich",
    name: "OHHO Special Chicken Sandwich",
    emoji: "⭐",
    description:
      "Double-stacked signature feast of flame-grilled chicken, secret savory glaze, and caramelized onions on thick brioche.",
    ingredients: ["Flame-grilled Chicken", "Secret Glaze", "Caramelized Onions", "Thick Brioche", "Cheese"],
    image: "https://www.ohhofoods.com/assets/Ohho%20Special%20Chicken%20Sandwich--zEdDhvn.jpeg",
    category: "Sandwiches",
    price: 189,
    kcal: 658,
    prepTime: "8 min",
    spice: 2,
    tag: "Signature",
    audioDescription:
      "The OHHO Special Chicken Sandwich. A double-stacked signature feast of flame-grilled chicken, our secret savory glaze, and caramelized onions on thick brioche. The secret is in the glaze.",
  },
  {
    id: "chicken-classic-pizza",
    name: "Chicken Classic Pizza",
    emoji: "🍕",
    description:
      "Golden-crust pizza topped with tender seasoned chicken, vibrant peppers, and red onions with melting mozzarella.",
    ingredients: ["Seasoned Chicken", "Bell Peppers", "Red Onions", "Mozzarella", "Golden Crust"],
    image: "https://www.ohhofoods.com/assets/Chicken%20Classic%20Pizza-BknIMXxm.jpeg",
    category: "Pizzas",
    price: 249,
    kcal: 712,
    prepTime: "12 min",
    spice: 1,
    audioDescription:
      "The Chicken Classic Pizza. A golden-crust pizza topped with tender seasoned chicken, vibrant peppers and red onions, blanketed in melting mozzarella. Hand-tossed. Stone-baked.",
  },
  {
    id: "ohho-special-chicken-pizza",
    name: "OHHO Special Chicken Pizza",
    emoji: "👑",
    description:
      "Signature masterpiece loaded with succulent chicken, vibrant green peppers, and zesty red paprika rings with premium cheese.",
    ingredients: ["Premium Chicken", "Green Peppers", "Red Paprika", "Premium Cheese", "Signature Base"],
    image: "https://www.ohhofoods.com/assets/%E2%80%8BOhho%20Special%20Chicken%20Pizza-fcdL9yP1.jpeg",
    category: "Pizzas",
    price: 299,
    kcal: 798,
    prepTime: "13 min",
    spice: 2,
    tag: "Signature",
    audioDescription:
      "The OHHO Special Chicken Pizza. Our signature masterpiece — loaded with succulent chicken, vibrant green peppers, and zesty red paprika rings, all on premium melted cheese. The crown jewel of our menu.",
  },
  {
    id: "spring-potato",
    name: "Spring Potato",
    emoji: "🥔",
    description:
      "Crispy, golden-fried potato spirals on a skewer, seasoned with a zesty blend of herbs and spices.",
    ingredients: ["Potatoes", "Herbs", "Spices", "Skewer"],
    image: "https://www.ohhofoods.com/assets/Spring%20Potato-B9KkB0Ju.jpeg",
    category: "Snacks",
    price: 89,
    kcal: 312,
    prepTime: "5 min",
    spice: 1,
    tag: "Trending",
    audioDescription:
      "The Spring Potato. Crispy, golden-fried potato spirals on a skewer, seasoned with a zesty blend of herbs and spices. The most-Instagrammed snack on the cart.",
  },
  {
    id: "craft-cold-coffee",
    name: "Craft Cold Coffee",
    emoji: "☕",
    description:
      "Velvety smooth mocha blend featuring rich chocolate and caramel drizzles topped with whipped cream and chocolate chips.",
    ingredients: ["Cold Coffee", "Chocolate", "Caramel", "Whipped Cream", "Chocolate Chips"],
    image: "https://www.ohhofoods.com/assets/Craft%20Cold%20Coffee-B_0Dh4dG.jpeg",
    category: "Shakes",
    price: 129,
    kcal: 386,
    prepTime: "4 min",
    spice: 1,
    audioDescription:
      "The Craft Cold Coffee. A velvety smooth mocha blend featuring rich chocolate and caramel drizzles, topped with whipped cream and chocolate chips. Liquid dessert, basically.",
  },
  {
    id: "pure-boost-shake",
    name: "Pure Boost Shake",
    emoji: "💪",
    description:
      "Wholesome, nutrient-packed powerhouse loaded with premium dry fruits, almonds, cashews, and dates for natural energy.",
    ingredients: ["Milk", "Almonds", "Cashews", "Dates", "Dry Fruits"],
    image: "https://www.ohhofoods.com/assets/Pure%20Boost%20Shake-wRW5UoeU.jpeg",
    category: "Shakes",
    price: 149,
    kcal: 412,
    prepTime: "4 min",
    spice: 1,
    audioDescription:
      "The Pure Boost Shake. A wholesome, nutrient-packed powerhouse loaded with premium dry fruits, almonds, cashews and dates for natural energy. Your morning, upgraded.",
  },
  {
    id: "prime-boost-shake",
    name: "Prime Boost — Signature Power Shake",
    emoji: "⚡",
    description:
      "Premium, nutrient-dense blend topped with deluxe roasted almonds, cashews, sweet dates, and succulent figs.",
    ingredients: ["Premium Milk", "Roasted Almonds", "Cashews", "Dates", "Figs", "Honey"],
    image: "https://www.ohhofoods.com/assets/Prime%20Boost%20-%20Signature%20Power%20Shake-tqxQJ7c_.jpeg",
    category: "Shakes",
    price: 179,
    kcal: 468,
    prepTime: "5 min",
    spice: 1,
    tag: "Signature",
    audioDescription:
      "The Prime Boost — our signature power shake. A premium, nutrient-dense blend topped with deluxe roasted almonds, cashews, sweet dates and succulent figs. This is what high-performance tastes like.",
  },
  {
    id: "fusion-fuel-shake",
    name: "Fusion Fuel — Ultimate Energy Shake",
    emoji: "🔥",
    description:
      "Banana, chikoo, dates, peanut butter, and premium dry fruits blended into a thick, creamy powerhouse.",
    ingredients: ["Banana", "Chikoo", "Dates", "Peanut Butter", "Dry Fruits", "Premium Milk"],
    image: "https://www.ohhofoods.com/assets/Fusion%20Fuel%20-%20Ultimate%20Energy%20Shake-CCDHEVAC.jpeg",
    category: "Shakes",
    price: 199,
    kcal: 524,
    prepTime: "5 min",
    spice: 1,
    tag: "Trending",
    audioDescription:
      "The Fusion Fuel — our ultimate energy shake. Banana, chikoo, dates, peanut butter and premium dry fruits, blended into a thick creamy powerhouse. Pre-workout, post-workout, anytime fuel.",
  },
];

export const categories = [
  { id: "Burgers", label: "Burgers", emoji: "🍔", color: "#ff6a00", tagline: "Crispy, juicy, stacked." },
  { id: "Sandwiches", label: "Sandwiches", emoji: "🥪", color: "#ffc107", tagline: "Grilled, glazed, loaded." },
  { id: "Pizzas", label: "Pizzas", emoji: "🍕", color: "#d92626", tagline: "Stone-baked. Premium cheese." },
  { id: "Snacks", label: "Snacks", emoji: "🍟", color: "#ff8c00", tagline: "Quick bites, big crunch." },
  { id: "Shakes", label: "Shakes & Beverages", emoji: "🥤", color: "#ffd54f", tagline: "Thick, cold, fuel-up." },
] as const;

// OHHO Food Ventures — 5-stage business model
export const ventureStages = [
  {
    id: 1,
    title: "Market & Research",
    short: "We scout the location.",
    body: "Every OHHO territory starts with ground-truth research — footfall, demographic pull, competitor density, day-part demand. We don't open a cart because a spot is available; we open it because the math says it wins.",
    icon: "Target",
    color: "#ff6a00",
  },
  {
    id: 2,
    title: "Manufacture Premium Carts",
    short: "We build the cart.",
    body: "OHHO Food Ventures is a manufacturer of premium food carts — fabricated in-house, branded to spec, fitted with commercial-grade equipment. The cart itself is a brand asset, not just a kitchen.",
    icon: "Wrench",
    color: "#ffc107",
  },
  {
    id: 3,
    title: "Operate End-to-End",
    short: "We run it ourselves.",
    body: "We don't hand over unproven locations. We open, staff, run, and tune the cart ourselves — supply chain, SOPs, menu engineering, POS, delivery ops. Every glitch surfaces and gets fixed before a franchisee ever touches it.",
    icon: "Settings",
    color: "#d92626",
  },
  {
    id: 4,
    title: "Prove the Model",
    short: "We win the location.",
    body: "A territory only becomes available to franchise once it has crossed our profitability threshold — verified unit economics, customer return-rate, and consistent monthly margin. The location is a proven cash-flow asset.",
    icon: "Trophy",
    color: "#ff8c00",
  },
  {
    id: 5,
    title: "Franchise for Passive Income",
    short: "We hand you the keys.",
    body: "We package the winning location — cart, brand, menu, supply chain, ops playbook — and offer it to a franchise partner. You bring the capital and the local presence; we keep the engine running. Passive income, on a proven model.",
    icon: "Handshake",
    color: "#ffd54f",
  },
] as const;

// Metro hub cards (per ohhofoods.com — marketing positioning)
export const presenceHubs = [
  { city: "Delhi", area: "Connaught Place — North Hub", outlets: 10, revenue: "₹14.5 Cr", rating: 4.9 },
  { city: "Mumbai", area: "Lower Parel — Main Hub", outlets: 12, revenue: "₹15.2 Cr", rating: 4.8 },
  { city: "Bangalore", area: "Indiranagar — South Hub", outlets: 8, revenue: "₹12.8 Cr", rating: 4.7 },
  { city: "Hyderabad", area: "Jubilee Hills — East Hub", outlets: 7, revenue: "₹10.1 Cr", rating: 4.8 },
  { city: "Pune", area: "Hinjewadi — West Hub", outlets: 6, revenue: "₹9.3 Cr", rating: 4.6 },
  { city: "Kolkata", area: "Salt Lake — Gateway Hub", outlets: 5, revenue: "₹7.2 Cr", rating: 4.5 },
];

export const ohhoStats = [
  { value: 48, suffix: "+", label: "Active Outlets" },
  { value: 100, suffix: "K+", label: "Happy Customers" },
  { value: 18, suffix: "+", label: "Major Cities" },
  { value: 45, suffix: " days", label: "Setup Time" },
];

export const contactInfo = {
  phones: ["+91 7006712347", "+91 9650443642", "+91 9652852780"],
  email: "sales@ohhofoods.com",
  website: "www.ohhofoods.com",
  instagram: "@ohhofoodventures",
  origin: "Shamli & Kairana, Uttar Pradesh, India",
};
