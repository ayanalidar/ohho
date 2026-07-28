// Generate all OHHO menu + brand images via z-ai-web-dev-sdk
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/ohho-images';

type Job = {
  slug: string;
  prompt: string;
  size: string;
};

// Premium food photography style — dark background, dramatic lighting, closeup, top-down or 45° angle
const STYLE = "professional food photography, dark moody background, warm dramatic lighting, closeup, 45 degree angle, shallow depth of field, ultra detailed, high quality, premium QSR brand aesthetic, vibrant orange and gold tones";

const jobs: Job[] = [
  // Burgers
  { slug: 'crispy-chicken-burger', size: '1024x1024', prompt: `A single crispy fried chicken burger with sesame bun, lettuce, tomato, melted cheese, on a dark slate surface, ${STYLE}` },
  { slug: 'ohho-special-chicken-burger', size: '1024x1024', prompt: `A double-stacked fried chicken burger with extra cheese blend, mayo, lettuce, tomato, onions, on a dark slate surface, ${STYLE}` },
  // Pizzas
  { slug: 'fire-pizza', size: '1024x1024', prompt: `A wood-fired pizza with charred crust, melted mozzarella, chili flakes, hot spicy chicken topping, on a dark surface, ${STYLE}` },
  { slug: 'veg-supreme-pizza', size: '1024x1024', prompt: `A vegetarian supreme pizza with bell peppers, onions, mushrooms, sweet corn, olives, melting cheese, on a dark surface, ${STYLE}` },
  { slug: 'classic-chicken-pizza', size: '1024x1024', prompt: `A classic chicken pizza with seasoned chicken pieces, bell peppers, red onions, mozzarella cheese, golden crust, on a dark surface, ${STYLE}` },
  { slug: 'ohho-special-chicken-pizza', size: '1024x1024', prompt: `A premium special chicken pizza loaded with seasoned chicken, green peppers, red paprika rings, extra cheese, on a dark surface, ${STYLE}` },
  { slug: 'supreme-chicken-pizza', size: '1024x1024', prompt: `A luxurious supreme chicken pizza with double chicken, premium cheese blend, herbs, paprika, on a dark surface, ${STYLE}` },
  // Sandwiches
  { slug: 'classic-chicken-sandwich', size: '1024x1024', prompt: `A classic grilled chicken sandwich with cheddar cheese, crisp veggies, on toasted sourdough bread, on a dark surface, ${STYLE}` },
  { slug: 'ohho-special-chicken-sandwich', size: '1024x1024', prompt: `A double-stacked flame-grilled chicken sandwich with secret glaze, caramelized onions, on thick brioche bread, on a dark surface, ${STYLE}` },
  // Buckets
  { slug: 'crispy-chicken-bucket-half', size: '1024x1024', prompt: `A small bucket of crispy fried chicken pieces, golden brown, half full, on a dark surface with ketchup dip, ${STYLE}` },
  { slug: 'crispy-chicken-bucket-full', size: '1024x1024', prompt: `A full bucket overflowing with crispy fried chicken pieces, golden brown, on a dark surface with dips, ${STYLE}` },
  // Sips
  { slug: 'cold-coffee', size: '1024x1024', prompt: `A tall glass of cold coffee with whipped cream, chocolate drizzle, chocolate chips, on a dark surface with condensation, ${STYLE}` },
  // Add-ons
  { slug: 'extra-cheese', size: '1024x1024', prompt: `A small bowl of melted extra cheese sauce, golden yellow, with herbs sprinkled on top, on a dark surface, ${STYLE}` },
  { slug: 'extra-patty', size: '1024x1024', prompt: `A single crispy fried chicken patty, golden brown, on a dark surface, garnished with herbs, ${STYLE}` },
  { slug: 'extra-dips', size: '1024x1024', prompt: `Three small dipping sauce bowls - mayo, ketchup, spicy - on a dark surface, ${STYLE}` },
  // Brand & cart
  { slug: 'ohho-cart-1', size: '1344x768', prompt: `A premium modern food cart kiosk with orange and gold branding, illuminated sign saying BURGERS, glass display counter, in a busy Indian street at dusk, professional commercial photography, vibrant` },
  { slug: 'ohho-cart-2', size: '1344x768', prompt: `A sleek mobile food cart with orange branding, illuminated at night, serving burgers, with a small queue of customers, urban Indian setting, professional photography` },
  { slug: 'ohho-cart-3', size: '1344x768', prompt: `A premium food cart interior view, clean stainless steel, brand sign, grill station, professional QSR photography, warm lighting` },
  // Hero backdrop
  { slug: 'hero-burger', size: '1440x720', prompt: `Cinematic hero shot of an OHHO special double chicken burger, melted cheese dripping, dark dramatic background with orange glow, steam rising, premium QSR advertising photography, ultra detailed` },
];

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  
  let success = 0;
  let failed = 0;
  
  for (const job of jobs) {
    const outPath = path.join(OUT_DIR, `${job.slug}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`✓ SKIP (exists): ${job.slug}`);
      success++;
      continue;
    }
    try {
      console.log(`→ Generating: ${job.slug} (${job.size})`);
      const response = await zai.images.generations.create({
        prompt: job.prompt,
        size: job.size as any,
      });
      const b64 = response.data[0].base64;
      const buf = Buffer.from(b64, 'base64');
      fs.writeFileSync(outPath, buf);
      console.log(`✓ ${job.slug} (${(buf.length / 1024).toFixed(0)} KB)`);
      success++;
    } catch (err: any) {
      console.error(`✗ ${job.slug}: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Done: ${success} success, ${failed} failed ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
