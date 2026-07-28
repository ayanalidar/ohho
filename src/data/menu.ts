// OHHO BURGERS menu data — synced with the actual ohhofoods.com / @ohhofoodventures menu
// All prices in INR. Images are AI-generated premium food photography stored locally.

export type MenuItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  image: string;
  category: "Burgers" | "Pizza" | "Sandwiches" | "Buckets" | "Sips" | "Add-ons";
  price: number;
  kcal: number;
  prepTime: string;
  spice: 0 | 1 | 2 | 3;
  tag?: string;
  isAddOn?: boolean;
  signature?: boolean;
};

export const menuItems: MenuItem[] = [
  // ─── BURGERS ──────────────────────────────────────────
  {
    id: "crispy-chicken-burger",
    name: "Crispy Chicken Burger",
    emoji: "🍔",
    description:
      "Crispy-coated fried chicken patty with fresh veggies and gooey melted cheese on a toasted sesame bun. The OHHO original — crunchy, juicy, timeless.",
    ingredients: ["Crispy Chicken Patty", "Melted Cheese", "Fresh Veggies", "Sesame Bun"],
    image: "/ohho-images/crispy-chicken-burger.png",
    category: "Burgers",
    price: 120,
    kcal: 568,
    prepTime: "6 min",
    spice: 1,
    tag: "Bestseller",
  },
  {
    id: "ohho-special-chicken-burger",
    name: "OHHO Special Chicken Burger",
    emoji: "🔥",
    description:
      "Double-stacked, succulent fried chicken thighs layered with a rich cheese blend, premium mayo, tomato, lettuce, and onions. Our flagship — built for serious appetites.",
    ingredients: ["Double Chicken Thighs", "Cheese Blend", "Premium Mayo", "Tomato", "Lettuce", "Onions"],
    image: "/ohho-images/ohho-special-chicken-burger.png",
    category: "Burgers",
    price: 170,
    kcal: 824,
    prepTime: "9 min",
    spice: 2,
    tag: "Signature",
    signature: true,
  },

  // ─── PIZZA ────────────────────────────────────────────
  {
    id: "fire-pizza",
    name: "Fire Pizza",
    emoji: "🌶️",
    description:
      "Wood-fired crust loaded with molten mozzarella, chili flakes, and our signature spicy chicken topping. For the ones who order 'extra hot' without flinching.",
    ingredients: ["Charred Crust", "Mozzarella", "Chili Flakes", "Spicy Chicken"],
    image: "/ohho-images/fire-pizza.png",
    category: "Pizza",
    price: 89,
    kcal: 612,
    prepTime: "11 min",
    spice: 3,
    tag: "Spicy",
  },
  {
    id: "veg-supreme-pizza",
    name: "Veg Supreme Pizza",
    emoji: "🥬",
    description:
      "Golden-crust vegetarian feast — bell peppers, onions, mushrooms, sweet corn, and olives under a blanket of melting mozzarella. The only veg pizza you'll ever need.",
    ingredients: ["Bell Peppers", "Onions", "Mushrooms", "Sweet Corn", "Olives", "Mozzarella"],
    image: "/ohho-images/veg-supreme-pizza.png",
    category: "Pizza",
    price: 100,
    kcal: 542,
    prepTime: "11 min",
    spice: 1,
    tag: "Veg",
  },
  {
    id: "classic-chicken-pizza",
    name: "Classic Chicken Pizza",
    emoji: "🍕",
    description:
      "Golden-crust pizza topped with tender seasoned chicken, vibrant peppers, and red onions with melting mozzarella. Hand-tossed. Stone-baked.",
    ingredients: ["Seasoned Chicken", "Bell Peppers", "Red Onions", "Mozzarella", "Golden Crust"],
    image: "/ohho-images/classic-chicken-pizza.png",
    category: "Pizza",
    price: 120,
    kcal: 712,
    prepTime: "12 min",
    spice: 1,
  },
  {
    id: "ohho-special-chicken-pizza",
    name: "OHHO Special Chicken Pizza",
    emoji: "👑",
    description:
      "Signature masterpiece loaded with succulent chicken, vibrant green peppers, and zesty red paprika rings with premium cheese. The crown jewel of our menu.",
    ingredients: ["Premium Chicken", "Green Peppers", "Red Paprika", "Premium Cheese", "Signature Base"],
    image: "/ohho-images/ohho-special-chicken-pizza.png",
    category: "Pizza",
    price: 150,
    kcal: 798,
    prepTime: "13 min",
    spice: 2,
    tag: "Signature",
    signature: true,
  },
  {
    id: "supreme-chicken-pizza",
    name: "Supreme Chicken Pizza",
    emoji: "⭐",
    description:
      "Double the chicken, double the cheese, double the indulgence. Our most loaded pizza — for when 'extra' is the only option.",
    ingredients: ["Double Chicken", "Premium Cheese Blend", "Herbs", "Paprika", "Signature Base"],
    image: "/ohho-images/supreme-chicken-pizza.png",
    category: "Pizza",
    price: 250,
    kcal: 924,
    prepTime: "14 min",
    spice: 2,
    tag: "Premium",
  },

  // ─── SANDWICHES ───────────────────────────────────────
  {
    id: "classic-chicken-sandwich",
    name: "Classic Chicken Sandwich",
    emoji: "🍞",
    description:
      "Layers of succulent grilled chicken, melted cheddar, and crisp veggies on toasted sourdough. A classic — perfected.",
    ingredients: ["Grilled Chicken", "Cheddar Cheese", "Crisp Veggies", "Toasted Sourdough"],
    image: "/ohho-images/classic-chicken-sandwich.png",
    category: "Sandwiches",
    price: 99,
    kcal: 482,
    prepTime: "6 min",
    spice: 1,
  },
  {
    id: "ohho-special-chicken-sandwich",
    name: "OHHO Special Chicken Sandwich",
    emoji: "⭐",
    description:
      "Double-stacked signature feast of flame-grilled chicken, secret savory glaze, and caramelized onions on thick brioche. The secret is in the glaze.",
    ingredients: ["Flame-grilled Chicken", "Secret Glaze", "Caramelized Onions", "Thick Brioche", "Cheese"],
    image: "/ohho-images/ohho-special-chicken-sandwich.png",
    category: "Sandwiches",
    price: 120,
    kcal: 658,
    prepTime: "8 min",
    spice: 2,
    tag: "Signature",
    signature: true,
  },

  // ─── BUCKETS ──────────────────────────────────────────
  {
    id: "crispy-chicken-bucket-half",
    name: "Crispy Chicken Bucket (Half)",
    emoji: "🍗",
    description:
      "A half bucket of golden-fried, extra-crispy chicken pieces — perfect for one (or two, if you're willing to share). Served with ketchup dip.",
    ingredients: ["Fried Chicken Pieces", "Secret Breading", "Ketchup Dip"],
    image: "/ohho-images/crispy-chicken-bucket-half.png",
    category: "Buckets",
    price: 149,
    kcal: 742,
    prepTime: "10 min",
    spice: 1,
    tag: "Trending",
  },
  {
    id: "crispy-chicken-bucket-full",
    name: "Crispy Chicken Bucket (Full)",
    emoji: "🪣",
    description:
      "A full bucket overflowing with golden-fried, extra-crispy chicken pieces — built for the table. Served with three dips. Sharing optional.",
    ingredients: ["Full Bucket Fried Chicken", "Secret Breading", "3 Dips", "Herbs"],
    image: "/ohho-images/crispy-chicken-bucket-full.png",
    category: "Buckets",
    price: 250,
    kcal: 1484,
    prepTime: "12 min",
    spice: 1,
    tag: "Bestseller",
  },

  // ─── SIPS ─────────────────────────────────────────────
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    emoji: "☕",
    description:
      "Velvety smooth mocha blend featuring rich chocolate and caramel drizzles topped with whipped cream and chocolate chips. Liquid dessert, basically.",
    ingredients: ["Cold Coffee", "Chocolate", "Caramel", "Whipped Cream", "Chocolate Chips"],
    image: "/ohho-images/cold-coffee.png",
    category: "Sips",
    price: 89,
    kcal: 386,
    prepTime: "4 min",
    spice: 0,
    tag: "Sip",
  },

  // ─── ADD-ONS ──────────────────────────────────────────
  {
    id: "extra-cheese",
    name: "Extra Cheese",
    emoji: "🧀",
    description: "A generous ladle of molten cheese sauce, drizzled over anything you order. Because 'extra cheese' should mean extra.",
    ingredients: ["Molten Cheese Sauce", "Herbs"],
    image: "/ohho-images/extra-cheese.png",
    category: "Add-ons",
    price: 25,
    kcal: 142,
    prepTime: "1 min",
    spice: 0,
    isAddOn: true,
  },
  {
    id: "extra-patty",
    name: "Extra Patty",
    emoji: "🍗",
    description: "Add another crispy chicken patty to any burger. Double the crunch, double the protein.",
    ingredients: ["Crispy Chicken Patty"],
    image: "/ohho-images/extra-patty.png",
    category: "Add-ons",
    price: 69,
    kcal: 312,
    prepTime: "2 min",
    spice: 1,
    isAddOn: true,
  },
  {
    id: "extra-dips",
    name: "Extra Dips",
    emoji: "🥣",
    description: "Three dips of your choice — mayo, ketchup, and our signature spicy blend. For the dippers, the dunkers, and the drizzlers.",
    ingredients: ["Mayo", "Ketchup", "Spicy Dip"],
    image: "/ohho-images/extra-dips.png",
    category: "Add-ons",
    price: 10,
    kcal: 98,
    prepTime: "1 min",
    spice: 0,
    isAddOn: true,
  },
];

export const categories = [
  { id: "Burgers", label: "Burgers", emoji: "🍔", color: "#ff6a00", tagline: "Crispy, juicy, stacked.", year: "2019", era: "The Origin Era", blurb: "Where it all started — a single cart in Kairana, a perfectly crispy chicken patty, and a queue that didn't end. The burger built the brand." },
  { id: "Pizza", label: "Pizza", emoji: "🍕", color: "#ffc107", tagline: "Stone-baked. Premium cheese.", year: "2021", era: "The Stone Era", blurb: "Compact stone-bake ovens engineered into 50 sq. ft. carts. A pizza, in 12 minutes, that competes with the chains — at half the price-point, twice the cheese." },
  { id: "Sandwiches", label: "Sandwiches", emoji: "🥪", color: "#d92626", tagline: "Grilled, glazed, loaded.", year: "2020", era: "The Brioche Era", blurb: "Customers asked for portable. We answered with flame-grilled stacks on thick brioche — a secret glaze made in batches of 20 litres, never more, never less." },
  { id: "Buckets", label: "Buckets", emoji: "🪣", color: "#ff8c00", tagline: "Share. Or don't.", year: "2022", era: "The Bucket Era", blurb: "Crispy fried chicken in half- and full-bucket formats. The most-ordered item across both our test locations, with a 80% customer return-rate." },
  { id: "Sips", label: "Sips", emoji: "🥤", color: "#ffd54f", tagline: "Thick, cold, fuel-up.", year: "2023", era: "The Sip Era", blurb: "Cold coffee done right — velvety mocha blend, whipped cream, chocolate drizzle. The cart became a day-part brand, not just a meal stop." },
  { id: "Add-ons", label: "Add-ons", emoji: "✨", color: "#ffb74d", tagline: "Extra cheese. Extra everything.", year: "2024", era: "The Extra Era", blurb: "Because 'extra' should mean extra. Cheese, patties, dips — three ways to make any order louder. Our highest-margin category, by design." },
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
    body: "A territory only becomes available to franchise once it has crossed our profitability threshold — verified unit economics, customer return-rate (currently 80% across our 2 tested locations), and consistent monthly margin. The location is a proven cash-flow asset.",
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

// Real stats — synced with actual operations
export const ohhoStats = [
  { value: 2, suffix: "", label: "Locations Tested" },
  { value: 10000, suffix: "+", label: "Happy Customers" },
  { value: 80, suffix: "%", label: "Retention Rate" },
  { value: 45, suffix: " days", label: "Franchise Setup" },
];

// Tested locations — these are the verified operational outlets (Shamli & Kairana)
export const testedLocations = [
  {
    city: "Kairana",
    area: "Nawab Market — Flagship Cart",
    status: "Operational",
    rating: 4.9,
    customers: 6500,
    note: "The first OHHO cart. Still our highest-volume outlet. Origin of the brand.",
    image: "/ohho-images/ohho-cart-1.png",
  },
  {
    city: "Shamli",
    area: "Main Road — Test Cart #2",
    status: "Operational",
    rating: 4.8,
    customers: 3800,
    note: "Second location. Validated that the model replicates beyond the home turf.",
    image: "/ohho-images/ohho-cart-2.png",
  },
];

export const contactInfo = {
  phones: ["+91 7006712347", "+91 9650443642", "+91 9652852780"],
  email: "sales@ohhofoods.com",
  website: "www.ohhofoods.com",
  instagram: "@ohhofoodventures",
  origin: "Shamli & Kairana, Uttar Pradesh, India",
};

// Rewards tiers — replaces the audio rings section
export const rewardTiers = [
  {
    id: "bronze",
    name: "Bronze",
    color: "#cd7f32",
    threshold: "0 – 499 pts",
    perks: ["1 pt per ₹10 spent", "Birthday free Cold Coffee", "Early access to new menu drops"],
    icon: "🥉",
  },
  {
    id: "silver",
    name: "Silver",
    color: "#c0c0c0",
    threshold: "500 – 1,999 pts",
    perks: ["1.25 pts per ₹10 spent", "Free Extra Cheese on every order", "Priority delivery queue", "5% off on birthdays month"],
    icon: "🥈",
  },
  {
    id: "gold",
    name: "Gold",
    color: "#ffc107",
    threshold: "2,000 – 4,999 pts",
    perks: ["1.5 pts per ₹10 spent", "Free upgrade to OHHO Special on any burger order", "Exclusive Gold-only menu items", "Free monthly Sip"],
    icon: "🥇",
  },
  {
    id: "black",
    name: "OHHO Black",
    color: "#ff6a00",
    threshold: "5,000+ pts (invite only)",
    perks: ["2 pts per ₹10 spent", "First-dibs on franchise slots in your city", "Personal cart-manager concierge", "Free OHHO Special Chicken Pizza every week", "Annual founders' dinner invite"],
    icon: "⚫",
  },
];

export const customerStories = [
  {
    name: "Aarav S.",
    location: "Kairana",
    rating: 5,
    text: "I've been eating at the Kairana cart since the day it opened. The Crispy Chicken Burger is exactly the same now as it was on day 1 — that's why I keep coming back. Easily 30+ visits.",
    initials: "AS",
    orders: 32,
  },
  {
    name: "Meera J.",
    location: "Shamli",
    rating: 5,
    text: "The Fire Pizza is unreal. I work nearby and order twice a week. The app's live tracker is the only reason my colleagues haven't stolen my lunch yet — I know exactly when to go down.",
    initials: "MJ",
    orders: 48,
  },
  {
    name: "Rohit K.",
    location: "Kairana",
    rating: 5,
    text: "Full bucket + extra dips = my Friday night ritual. Quality has never dipped in 2 years. That retention rate they advertise — I'm literally it.",
    initials: "RK",
    orders: 67,
  },
  {
    name: "Sana P.",
    location: "Shamli",
    rating: 4,
    text: "Special Chicken Sandwich with extra cheese. Don't bother with anything else. The brioche is unreal. Wish they opened more carts in nearby towns.",
    initials: "SP",
    orders: 19,
  },
];
