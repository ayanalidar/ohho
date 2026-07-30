import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

function genReferralCode(name: string) {
  return "OHHO-" + name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) + Math.floor(Math.random() * 90 + 10);
}

// Seed data — synced with the current static menu data
const SEED_MENU_ITEMS = [
  // BURGERS
  { slug: "crispy-chicken-burger", name: "Crispy Chicken Burger", emoji: "🍔", description: "Crispy-coated fried chicken patty with fresh veggies and gooey melted cheese on a toasted sesame bun. The OHHO original — crunchy, juicy, timeless.", ingredients: ["Crispy Chicken Patty","Melted Cheese","Fresh Veggies","Sesame Bun"], image: "/ohho-images/crispy-chicken-burger.png", category: "Burgers", price: 120, kcal: 568, prepTime: "6 min", spice: 1, tag: "Bestseller", isAddOn: false, signature: false, sortOrder: 1 },
  { slug: "ohho-special-chicken-burger", name: "OHHO Special Chicken Burger", emoji: "🔥", description: "Double-stacked, succulent fried chicken thighs layered with a rich cheese blend, premium mayo, tomato, lettuce, and onions. Our flagship — built for serious appetites.", ingredients: ["Double Chicken Thighs","Cheese Blend","Premium Mayo","Tomato","Lettuce","Onions"], image: "/ohho-images/ohho-special-chicken-burger.png", category: "Burgers", price: 170, kcal: 824, prepTime: "9 min", spice: 2, tag: "Signature", isAddOn: false, signature: true, sortOrder: 2 },
  // PIZZA
  { slug: "fire-pizza", name: "Fire Pizza", emoji: "🌶️", description: "Wood-fired crust loaded with molten mozzarella, chili flakes, and our signature spicy chicken topping. For the ones who order 'extra hot' without flinching.", ingredients: ["Charred Crust","Mozzarella","Chili Flakes","Spicy Chicken"], image: "/ohho-images/fire-pizza.png", category: "Pizza", price: 89, kcal: 612, prepTime: "11 min", spice: 3, tag: "Spicy", isAddOn: false, signature: false, sortOrder: 1 },
  { slug: "veg-supreme-pizza", name: "Veg Supreme Pizza", emoji: "🥬", description: "Golden-crust vegetarian feast — bell peppers, onions, mushrooms, sweet corn, and olives under a blanket of melting mozzarella. The only veg pizza you'll ever need.", ingredients: ["Bell Peppers","Onions","Mushrooms","Sweet Corn","Olives","Mozzarella"], image: "/ohho-images/veg-supreme-pizza.png", category: "Pizza", price: 100, kcal: 542, prepTime: "11 min", spice: 1, tag: "Veg", isAddOn: false, signature: false, sortOrder: 2 },
  { slug: "classic-chicken-pizza", name: "Classic Chicken Pizza", emoji: "🍕", description: "Golden-crust pizza topped with tender seasoned chicken, vibrant peppers, and red onions with melting mozzarella. Hand-tossed. Stone-baked.", ingredients: ["Seasoned Chicken","Bell Peppers","Red Onions","Mozzarella","Golden Crust"], image: "/ohho-images/classic-chicken-pizza.png", category: "Pizza", price: 120, kcal: 712, prepTime: "12 min", spice: 1, tag: null, isAddOn: false, signature: false, sortOrder: 3 },
  { slug: "ohho-special-chicken-pizza", name: "OHHO Special Chicken Pizza", emoji: "👑", description: "Signature masterpiece loaded with succulent chicken, vibrant green peppers, and zesty red paprika rings with premium cheese. The crown jewel of our menu.", ingredients: ["Premium Chicken","Green Peppers","Red Paprika","Premium Cheese","Signature Base"], image: "/ohho-images/ohho-special-chicken-pizza.png", category: "Pizza", price: 150, kcal: 798, prepTime: "13 min", spice: 2, tag: "Signature", isAddOn: false, signature: true, sortOrder: 4 },
  { slug: "supreme-chicken-pizza", name: "Supreme Chicken Pizza", emoji: "⭐", description: "Double the chicken, double the cheese, double the indulgence. Our most loaded pizza — for when 'extra' is the only option.", ingredients: ["Double Chicken","Premium Cheese Blend","Herbs","Paprika","Signature Base"], image: "/ohho-images/supreme-chicken-pizza.png", category: "Pizza", price: 250, kcal: 924, prepTime: "14 min", spice: 2, tag: "Premium", isAddOn: false, signature: false, sortOrder: 5 },
  // SANDWICHES
  { slug: "classic-chicken-sandwich", name: "Classic Chicken Sandwich", emoji: "🍞", description: "Layers of succulent grilled chicken, melted cheddar, and crisp veggies on toasted sourdough. A classic — perfected.", ingredients: ["Grilled Chicken","Cheddar Cheese","Crisp Veggies","Toasted Sourdough"], image: "/ohho-images/classic-chicken-sandwich.png", category: "Sandwiches", price: 99, kcal: 482, prepTime: "6 min", spice: 1, tag: null, isAddOn: false, signature: false, sortOrder: 1 },
  { slug: "ohho-special-chicken-sandwich", name: "OHHO Special Chicken Sandwich", emoji: "⭐", description: "Double-stacked signature feast of flame-grilled chicken, secret savory glaze, and caramelized onions on thick brioche. The secret is in the glaze.", ingredients: ["Flame-grilled Chicken","Secret Glaze","Caramelized Onions","Thick Brioche","Cheese"], image: "/ohho-images/ohho-special-chicken-sandwich.png", category: "Sandwiches", price: 120, kcal: 658, prepTime: "8 min", spice: 2, tag: "Signature", isAddOn: false, signature: true, sortOrder: 2 },
  // BUCKETS
  { slug: "crispy-chicken-bucket-half", name: "Crispy Chicken Bucket (Half)", emoji: "🍗", description: "A half bucket of golden-fried, extra-crispy chicken pieces — perfect for one (or two, if you're willing to share). Served with ketchup dip.", ingredients: ["Fried Chicken Pieces","Secret Breading","Ketchup Dip"], image: "/ohho-images/crispy-chicken-bucket-half.png", category: "Buckets", price: 149, kcal: 742, prepTime: "10 min", spice: 1, tag: "Trending", isAddOn: false, signature: false, sortOrder: 1 },
  { slug: "crispy-chicken-bucket-full", name: "Crispy Chicken Bucket (Full)", emoji: "🪣", description: "A full bucket overflowing with golden-fried, extra-crispy chicken pieces — built for the table. Served with three dips. Sharing optional.", ingredients: ["Full Bucket Fried Chicken","Secret Breading","3 Dips","Herbs"], image: "/ohho-images/crispy-chicken-bucket-full.png", category: "Buckets", price: 250, kcal: 1484, prepTime: "12 min", spice: 1, tag: "Bestseller", isAddOn: false, signature: false, sortOrder: 2 },
  // SIPS
  { slug: "cold-coffee", name: "Cold Coffee", emoji: "☕", description: "Velvety smooth mocha blend featuring rich chocolate and caramel drizzles topped with whipped cream and chocolate chips. Liquid dessert, basically.", ingredients: ["Cold Coffee","Chocolate","Caramel","Whipped Cream","Chocolate Chips"], image: "/ohho-images/cold-coffee.png", category: "Sips", price: 89, kcal: 386, prepTime: "4 min", spice: 0, tag: "Sip", isAddOn: false, signature: false, sortOrder: 1 },
  // ADD-ONS
  { slug: "extra-cheese", name: "Extra Cheese", emoji: "🧀", description: "A generous ladle of molten cheese sauce, drizzled over anything you order. Because 'extra cheese' should mean extra.", ingredients: ["Molten Cheese Sauce","Herbs"], image: "/ohho-images/extra-cheese.png", category: "Add-ons", price: 25, kcal: 142, prepTime: "1 min", spice: 0, tag: null, isAddOn: true, signature: false, sortOrder: 1 },
  { slug: "extra-patty", name: "Extra Patty", emoji: "🍗", description: "Add another crispy chicken patty to any burger. Double the crunch, double the protein.", ingredients: ["Crispy Chicken Patty"], image: "/ohho-images/extra-patty.png", category: "Add-ons", price: 69, kcal: 312, prepTime: "2 min", spice: 1, tag: null, isAddOn: true, signature: false, sortOrder: 2 },
  { slug: "extra-dips", name: "Extra Dips", emoji: "🥣", description: "Three dips of your choice — mayo, ketchup, and our signature spicy blend. For the dippers, the dunkers, and the drizzlers.", ingredients: ["Mayo","Ketchup","Spicy Dip"], image: "/ohho-images/extra-dips.png", category: "Add-ons", price: 10, kcal: 98, prepTime: "1 min", spice: 0, tag: null, isAddOn: true, signature: false, sortOrder: 3 },
];

const SEED_TIMELINE_ERAS = [
  { category: "Burgers", label: "Burgers", emoji: "🍔", color: "#ff6a00", tagline: "Crispy, juicy, stacked.", year: "2019", era: "The Origin Era", blurb: "Where it all started — a single cart in Kairana, a perfectly crispy chicken patty, and a queue that didn't end. The burger built the brand.", sortOrder: 1 },
  { category: "Pizza", label: "Pizza", emoji: "🍕", color: "#ffc107", tagline: "Stone-baked. Premium cheese.", year: "2021", era: "The Stone Era", blurb: "Compact stone-bake ovens engineered into 50 sq. ft. carts. A pizza, in 12 minutes, that competes with the chains — at half the price-point, twice the cheese.", sortOrder: 2 },
  { category: "Sandwiches", label: "Sandwiches", emoji: "🥪", color: "#d92626", tagline: "Grilled, glazed, loaded.", year: "2020", era: "The Brioche Era", blurb: "Customers asked for portable. We answered with flame-grilled stacks on thick brioche — a secret glaze made in batches of 20 litres, never more, never less.", sortOrder: 3 },
  { category: "Buckets", label: "Buckets", emoji: "🪣", color: "#ff8c00", tagline: "Share. Or don't.", year: "2022", era: "The Bucket Era", blurb: "Crispy fried chicken in half- and full-bucket formats. The most-ordered item across both our test locations, with a 80% customer return-rate.", sortOrder: 4 },
  { category: "Sips", label: "Sips", emoji: "🥤", color: "#ffd54f", tagline: "Thick, cold, fuel-up.", year: "2023", era: "The Sip Era", blurb: "Cold coffee done right — velvety mocha blend, whipped cream, chocolate drizzle. The cart became a day-part brand, not just a meal stop.", sortOrder: 5 },
  { category: "Add-ons", label: "Add-ons", emoji: "✨", color: "#ffb74d", tagline: "Extra cheese. Extra everything.", year: "2024", era: "The Extra Era", blurb: "Because 'extra' should mean extra. Cheese, patties, dips — three ways to make any order louder. Our highest-margin category, by design.", sortOrder: 6 },
];

const SEED_CATERING_PACKAGES = [
  { name: "Office Lunch Box", pax: "10 – 30 people", price: "₹199 / head", items: ["Crispy Chicken Burger","Cold Coffee","Extra Dips"], note: "Min 24h notice. Delivered hot.", color: "#ff6a00", sortOrder: 1 },
  { name: "Party Bucket", pax: "20 – 50 people", price: "₹299 / head", items: ["Crispy Chicken Bucket (Full)","2 Pizzas","Cold Coffee","Extra Dips"], note: "Our most popular catering package.", color: "#ffc107", sortOrder: 2 },
  { name: "Mega Feast", pax: "50+ people", price: "Custom quote", items: ["Unlimited Burgers & Pizzas","Buckets","Sips Bar","Dedicated cart staff"], note: "For weddings & large corporate events.", color: "#d92626", sortOrder: 3 },
];

const SEED_LOCATIONS = [
  { slug: "kairana", name: "OHHO Cart — Kairana", city: "Kairana", area: "Nawab Market — Flagship", status: "operational", rating: 4.9, customers: 6500, deliveryRadiusKm: 5, prepTimeExtra: "0 min", image: "/ohho-images/ohho-cart-1.png", active: true },
  { slug: "shamli", name: "OHHO Cart — Shamli", city: "Shamli", area: "Main Road — Test Cart #2", status: "operational", rating: 4.8, customers: 3800, deliveryRadiusKm: 5, prepTimeExtra: "2 min", image: "/ohho-images/ohho-cart-2.png", active: true },
];

export async function GET() {
  try {
    // 1. Seed menu items
    for (const item of SEED_MENU_ITEMS) {
      await db.menuItem.upsert({
        where: { slug: item.slug },
        create: { ...item, ingredients: JSON.stringify(item.ingredients), available: true },
        update: {},
      });
    }

    // 2. Seed timeline eras
    for (const era of SEED_TIMELINE_ERAS) {
      await db.timelineEra.upsert({
        where: { category: era.category },
        create: era,
        update: {},
      });
    }

    // 3. Seed catering packages
    for (const pkg of SEED_CATERING_PACKAGES) {
      const existing = await db.cateringPackage.findFirst({ where: { name: pkg.name } });
      if (!existing) {
        await db.cateringPackage.create({
          data: { ...pkg, items: JSON.stringify(pkg.items), available: true },
        });
      }
    }

    // 4. Seed locations
    for (const loc of SEED_LOCATIONS) {
      await db.location.upsert({
        where: { slug: loc.slug },
        create: loc,
        update: {},
      });
    }

    // 4b. Seed a coming-soon location with countdown
    const comingSoon = await db.location.findUnique({ where: { slug: "muzaffarnagar" } });
    if (!comingSoon) {
      await db.location.create({
        data: {
          slug: "muzaffarnagar",
          name: "OHHO Cart — Muzaffarnagar",
          city: "Muzaffarnagar",
          area: "Coming Soon — Next Launch",
          status: "coming-soon",
          rating: 0,
          customers: 0,
          deliveryRadiusKm: 5,
          prepTimeExtra: "0 min",
          image: "/ohho-images/ohho-cart-3.png",
          active: true,
          opensOn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      });
    }

    // 4c. Seed today's special
    const existingSpecial = await db.todaySpecial.findFirst({ where: { active: true } });
    if (!existingSpecial) {
      await db.todaySpecial.create({
        data: {
          title: "Buy 1 Get 1 Free on all Burgers",
          description: "Every Tuesday — buy any burger, get a Crispy Chicken Burger free. Use code at checkout.",
          code: "BOGO-TUE",
          badge: "🔥 Today's Special",
          active: true,
        },
      });
    }

    // 5. Create admin
    const adminEmail = "admin@ohhofoods.com";
    let admin = await db.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      admin = await db.user.create({
        data: {
          email: adminEmail,
          name: "OHHO Admin",
          passwordHash: await bcrypt.hash("admin123", 10),
          phone: "+91 7006712347",
          role: "ADMIN",
          loyaltyPoints: 0,
          walletBalance: 0,
          referralCode: genReferralCode("OHHOADMIN"),
        },
      });
    }

    // 6. Create demo customer
    const custEmail = "demo@ohhofoods.com";
    let cust = await db.user.findUnique({ where: { email: custEmail } });
    if (!cust) {
      const kairana = await db.location.findUnique({ where: { slug: "kairana" } });
      cust = await db.user.create({
        data: {
          email: custEmail,
          name: "Demo Customer",
          passwordHash: await bcrypt.hash("demo123", 10),
          phone: "+91 9650443642",
          role: "CUSTOMER",
          loyaltyPoints: 437,
          walletBalance: 55000,
          referralCode: genReferralCode("DemoCustomer"),
          addresses: JSON.stringify([
            { id: "addr1", label: "Home", line: "12 Shamli Rd, Kairana, UP 247774", pincode: "247774" },
            { id: "addr2", label: "Work", line: "Shop 4, Main Market, Shamli, UP 247774", pincode: "247774" },
          ]),
        },
      });
      void kairana;
    }

    // 7. Create demo operator for Kairana
    const opEmail = "kairana@ohhofoods.com";
    let operator = await db.user.findUnique({ where: { email: opEmail } });
    if (!operator) {
      const kairana = await db.location.findUnique({ where: { slug: "kairana" } });
      operator = await db.user.create({
        data: {
          email: opEmail,
          name: "Kairana Operator",
          passwordHash: await bcrypt.hash("operator123", 10),
          phone: "+91 9652852780",
          role: "OPERATOR",
          locationId: kairana?.id || null,
          loyaltyPoints: 0,
          walletBalance: 0,
          referralCode: genReferralCode("KairanaOp"),
        },
      });
    }

    // 8. Create demo past orders
    const existingOrders = await db.order.count({ where: { userId: cust.id } });
    if (existingOrders === 0) {
      const sampleItems = [
        { itemId: "ohho-special-chicken-burger", name: "OHHO Special Chicken Burger", emoji: "🔥", image: "/ohho-images/ohho-special-chicken-burger.png", price: 170, qty: 1 },
        { itemId: "cold-coffee", name: "Cold Coffee", emoji: "☕", image: "/ohho-images/cold-coffee.png", price: 89, qty: 1 },
        { itemId: "crispy-chicken-bucket-half", name: "Crispy Chicken Bucket (Half)", emoji: "🍗", image: "/ohho-images/crispy-chicken-bucket-half.png", price: 149, qty: 1 },
      ];
      const now = Date.now();
      const orders = [
        { daysAgo: 18, status: "ARRIVED", progress: 1, items: sampleItems.slice(0, 2), subtotal: 259, mode: "delivery" },
        { daysAgo: 11, status: "ARRIVED", progress: 1, items: [sampleItems[2], sampleItems[1]], subtotal: 238, mode: "delivery" },
        { daysAgo: 4, status: "ARRIVED", progress: 1, items: sampleItems, subtotal: 408, mode: "pickup" },
      ];
      for (const o of orders) {
        const subtotal = o.subtotal;
        const deliveryFee = o.mode === "delivery" ? (subtotal > 400 ? 0 : 39) : 0;
        const taxes = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + taxes;
        const seq = Math.floor(Math.random() * 90000) + 10000;
        await db.order.create({
          data: {
            orderId: `OHHO-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${seq}`,
            userId: cust.id,
            subtotal,
            deliveryFee,
            taxes,
            walletDebit: 0,
            total,
            mode: o.mode,
            status: o.status,
            address: o.mode === "delivery" ? "12 Shamli Rd, Kairana, UP 247774" : null,
            paymentMethod: "upi",
            paymentStatus: "PAID",
            etaSeconds: 1500,
            progress: o.progress,
            invoiceNumber: `INV-${new Date(now - o.daysAgo * 86400000).getFullYear()}${String(new Date(now - o.daysAgo * 86400000).getMonth() + 1).padStart(2, "0")}-${seq}`,
            createdAt: new Date(now - o.daysAgo * 86400000),
            locationId: (await db.location.findUnique({ where: { slug: "kairana" } }))?.id || null,
            items: { create: o.items },
          },
        });
      }
    }

    // 9. Return admin session
    const sessionUser: SessionUser = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
      loyaltyPoints: admin.loyaltyPoints,
      walletBalance: admin.walletBalance,
      referralCode: admin.referralCode,
      phone: admin.phone,
    };
    const token = await signSession(sessionUser);
    const res = NextResponse.json({
      ok: true,
      admin: { email: adminEmail, password: "admin123" },
      demoCustomer: { email: custEmail, password: "demo123" },
      kairanaOperator: { email: opEmail, password: "operator123" },
      message: "Seed complete. Menu items, timeline eras, catering packages, locations, users, and demo orders created.",
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // 10. Seed site content (editable CMS) — covers ALL text + images on every page
    const SITE_CONTENT_SEED: Array<{key: string, value: string, type: string, label: string, page: string, section: string}> = [
      // Hero section
      { key: "hero.eyebrow", value: "India's Fastest-Growing Premium QSR", type: "text", label: "Hero Eyebrow Text", page: "home", section: "hero" },
      { key: "hero.brand", value: "OHHO", type: "text", label: "Hero Brand Word 1", page: "home", section: "hero" },
      { key: "hero.brand2", value: "BURGERS", type: "text", label: "Hero Brand Word 2", page: "home", section: "hero" },
      { key: "hero.byline", value: "By OHHO Food Ventures", type: "text", label: "Hero Byline", page: "home", section: "hero" },
      { key: "hero.tagline_prefix", value: "Live Premium.", type: "text", label: "Hero Tagline Bold Part", page: "home", section: "hero" },
      { key: "hero.tagline", value: "Chicken burgers, pizzas, sandwiches & shakes — built for India, engineered for fast returns, delivered to your door with live tracking.", type: "textarea", label: "Hero Tagline", page: "home", section: "hero" },
      { key: "hero.cta1", value: "Order Now", type: "text", label: "Hero Button 1 Text", page: "home", section: "hero" },
      { key: "hero.cta2", value: "Explore Menu", type: "text", label: "Hero Button 2 Text", page: "home", section: "hero" },
      { key: "hero.cta3", value: "About the Company", type: "text", label: "Hero Button 3 Text", page: "home", section: "hero" },
      { key: "hero.image1", value: "/ohho-images/ohho-special-chicken-burger.png", type: "image", label: "Hero Cross-fade Image 1", page: "home", section: "hero" },
      { key: "hero.image2", value: "/ohho-images/ohho-special-chicken-pizza.png", type: "image", label: "Hero Cross-fade Image 2", page: "home", section: "hero" },
      { key: "hero.image3", value: "/ohho-images/ohho-special-chicken-sandwich.png", type: "image", label: "Hero Cross-fade Image 3", page: "home", section: "hero" },
      { key: "hero.image4", value: "/ohho-images/cold-coffee.png", type: "image", label: "Hero Cross-fade Image 4", page: "home", section: "hero" },
      // Stats
      { key: "stats.locations", value: "2", type: "text", label: "Stat: Locations Tested", page: "home", section: "stats" },
      { key: "stats.locations_label", value: "Locations Tested", type: "text", label: "Stat: Locations Label", page: "home", section: "stats" },
      { key: "stats.customers", value: "10000", type: "text", label: "Stat: Happy Customers", page: "home", section: "stats" },
      { key: "stats.customers_suffix", value: "+", type: "text", label: "Stat: Customers Suffix", page: "home", section: "stats" },
      { key: "stats.customers_label", value: "Happy Customers", type: "text", label: "Stat: Customers Label", page: "home", section: "stats" },
      { key: "stats.retention", value: "80", type: "text", label: "Stat: Retention Rate", page: "home", section: "stats" },
      { key: "stats.retention_suffix", value: "%", type: "text", label: "Stat: Retention Suffix", page: "home", section: "stats" },
      { key: "stats.retention_label", value: "Retention Rate", type: "text", label: "Stat: Retention Label", page: "home", section: "stats" },
      { key: "stats.setup", value: "45", type: "text", label: "Stat: Setup Time", page: "home", section: "stats" },
      { key: "stats.setup_suffix", value: " days", type: "text", label: "Stat: Setup Suffix", page: "home", section: "stats" },
      { key: "stats.setup_label", value: "Franchise Setup", type: "text", label: "Stat: Setup Label", page: "home", section: "stats" },
      // Footer
      { key: "footer.made_by", value: "GuardianX", type: "text", label: "Footer: Made & Maintained By", page: "global", section: "footer" },
      { key: "footer.copyright", value: "© 2025 OHHO Food Ventures · OHHO Burgers · All rights reserved.", type: "text", label: "Footer: Copyright Text", page: "global", section: "footer" },
      { key: "footer.tagline", value: "Live Premium.", type: "text", label: "Footer: Tagline", page: "global", section: "footer" },
      { key: "footer.description", value: "A new-age premium QSR brand by OHHO Food Ventures. From Shamli & Kairana to Pan-India — burgers, pizzas, sandwiches & shakes, delivered fresh and tracked live.", type: "textarea", label: "Footer: Brand Description", page: "global", section: "footer" },
      // Company page
      { key: "company.title", value: "OHHO FOOD VENTURES", type: "text", label: "Company: Title", page: "company", section: "hero" },
      { key: "company.tagline", value: "Live Premium", type: "text", label: "Company: Tagline", page: "company", section: "hero" },
      { key: "company.story", value: "A new-age premium quick-service restaurant brand from Shamli & Kairana. We blend indulgence with quality, built for India's booming QSR sector.", type: "textarea", label: "Company: Story", page: "company", section: "hero" },
      // Menu page
      { key: "menu.title", value: "The Menu, end to end.", type: "text", label: "Menu: Title", page: "menu", section: "header" },
      { key: "menu.subtitle", value: "Burgers, pizzas, sandwiches, buckets, sips & add-ons — every item, every price.", type: "textarea", label: "Menu: Subtitle", page: "menu", section: "header" },
      // Order page
      { key: "order.title", value: "Build your order, check out.", type: "text", label: "Order: Title", page: "order", section: "header" },
      { key: "order.subtitle", value: "Pick a category, add to cart, customize with add-ons, choose delivery or pickup, pay your way.", type: "textarea", label: "Order: Subtitle", page: "order", section: "header" },
      // Franchise page
      { key: "franchise.title", value: "From cart to passive income.", type: "text", label: "Franchise: Title", page: "franchise", section: "hero" },
      { key: "franchise.subtitle", value: "We don't hand over unproven locations. We scout, build, operate, and prove the model ourselves — then offer the winning territory to you.", type: "textarea", label: "Franchise: Subtitle", page: "franchise", section: "hero" },
      { key: "franchise.cta", value: "Become a Franchisee →", type: "text", label: "Franchise: CTA Button", page: "franchise", section: "hero" },
      // Catering page
      { key: "catering.title", value: "OHHO for your event.", type: "text", label: "Catering: Title", page: "catering", section: "hero" },
      { key: "catering.subtitle", value: "Office lunches, weddings, birthdays, corporate events — we cater them all. Premium burgers, pizzas, buckets & sips at scale. Min 24-hour notice.", type: "textarea", label: "Catering: Subtitle", page: "catering", section: "hero" },
      // Contact
      { key: "contact.email", value: "sales@ohhofoods.com", type: "text", label: "Contact: Email", page: "global", section: "contact" },
      { key: "contact.phone1", value: "+91 7006712347", type: "text", label: "Contact: Phone 1", page: "global", section: "contact" },
      { key: "contact.phone2", value: "+91 9650443642", type: "text", label: "Contact: Phone 2", page: "global", section: "contact" },
      { key: "contact.phone3", value: "+91 9652852780", type: "text", label: "Contact: Phone 3", page: "global", section: "contact" },
      { key: "contact.website", value: "www.ohhofoods.com", type: "text", label: "Contact: Website", page: "global", section: "contact" },
      { key: "contact.instagram", value: "@ohhofoodventures", type: "text", label: "Contact: Instagram", page: "global", section: "contact" },
      { key: "contact.origin", value: "Shamli & Kairana, Uttar Pradesh, India", type: "text", label: "Contact: Origin Location", page: "global", section: "contact" },
      // Today's special
      { key: "special.badge", value: "🔥 Today's Special", type: "text", label: "Special: Badge Text", page: "home", section: "special" },
      // Rewards
      { key: "rewards.title", value: "Eat. Earn. Climb tiers.", type: "text", label: "Rewards: Title", page: "home", section: "rewards" },
      { key: "rewards.subtitle", value: "Every ₹10 you spend earns 1 OHHO point. Climb through four tiers — Bronze to OHHO Black — and unlock real, repeat-customer perks.", type: "textarea", label: "Rewards: Subtitle", page: "home", section: "rewards" },
      // Live kitchen
      { key: "kitchen.title", value: "From grill to your door.", type: "text", label: "Kitchen: Title", page: "home", section: "kitchen" },
      { key: "kitchen.subtitle", value: "Watch every active OHHO order move through the pipeline in real time.", type: "textarea", label: "Kitchen: Subtitle", page: "home", section: "kitchen" },
      // Logo
      { key: "logo.url", value: "/ohho-images/ohho-logo-full.png", type: "image", label: "Logo: Full Logo URL", page: "global", section: "logo" },
    ];
    for (const c of SITE_CONTENT_SEED) {
      await db.siteContent.upsert({ where: { key: c.key }, create: c, update: {} });
    }

    return res;
  } catch (e: any) {
    console.error("seed error", e);
    return NextResponse.json({ error: e?.message || "Seed failed" }, { status: 500 });
  }
}
