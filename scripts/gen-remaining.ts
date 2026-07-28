// Generate remaining images sequentially with delays to avoid 429
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const STYLE = "professional food photography, dark moody background, warm dramatic lighting, closeup, 45 degree angle, shallow depth of field, ultra detailed, high quality, premium QSR brand aesthetic, vibrant orange and gold tones";
const OUT = '/home/z/my-project/public/ohho-images';

const jobs = [
  { slug: 'ohho-special-chicken-pizza', prompt: `A premium special chicken pizza loaded with seasoned chicken, green peppers, red paprika rings, extra cheese, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'supreme-chicken-pizza', prompt: `A luxurious supreme chicken pizza with double chicken, premium cheese blend, herbs, paprika, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'classic-chicken-sandwich', prompt: `A classic grilled chicken sandwich with cheddar cheese, crisp veggies, on toasted sourdough bread, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'ohho-special-chicken-sandwich', prompt: `A double-stacked flame-grilled chicken sandwich with secret glaze, caramelized onions, on thick brioche bread, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'crispy-chicken-bucket-half', prompt: `A small bucket of crispy fried chicken pieces, golden brown, half full, on a dark surface with ketchup dip, ${STYLE}`, size: '1024x1024' },
  { slug: 'crispy-chicken-bucket-full', prompt: `A full bucket overflowing with crispy fried chicken pieces, golden brown, on a dark surface with dips, ${STYLE}`, size: '1024x1024' },
  { slug: 'cold-coffee', prompt: `A tall glass of cold coffee with whipped cream, chocolate drizzle, chocolate chips, on a dark surface with condensation, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-cheese', prompt: `A small bowl of melted extra cheese sauce, golden yellow, with herbs sprinkled on top, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-patty', prompt: `A single crispy fried chicken patty, golden brown, on a dark surface, garnished with herbs, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-dips', prompt: `Three small dipping sauce bowls - mayo, ketchup, spicy - on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'ohho-cart-1', prompt: `A premium modern food cart kiosk with orange and gold branding, illuminated sign saying BURGERS, glass display counter, in a busy Indian street at dusk, professional commercial photography, vibrant`, size: '1344x768' },
  { slug: 'ohho-cart-2', prompt: `A sleek mobile food cart with orange branding, illuminated at night, serving burgers, with a small queue of customers, urban Indian setting, professional photography`, size: '1344x768' },
  { slug: 'ohho-cart-3', prompt: `A premium food cart interior view, clean stainless steel, brand sign, grill station, professional QSR photography, warm lighting`, size: '1344x768' },
  { slug: 'hero-burger', prompt: `Cinematic hero shot of an OHHO special double chicken burger, melted cheese dripping, dark dramatic background with orange glow, steam rising, premium QSR advertising photography, ultra detailed`, size: '1440x720' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const zai = await ZAI.create();
  let success = 0, failed = 0;
  for (const j of jobs) {
    const p = `${OUT}/${j.slug}.png`;
    if (fs.existsSync(p)) { console.log('SKIP', j.slug); success++; continue; }
    // Retry with backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`GEN [try ${attempt+1}] ${j.slug}`);
        const r = await zai.images.generations.create({ prompt: j.prompt, size: j.size as any });
        fs.writeFileSync(p, Buffer.from(r.data[0].base64, 'base64'));
        console.log('OK', j.slug, `${(fs.statSync(p).size/1024).toFixed(0)}KB`);
        success++;
        break;
      } catch (e: any) {
        console.error(`FAIL try${attempt+1} ${j.slug}: ${e.message}`);
        if (attempt < 2) {
          console.log('  waiting 15s before retry...');
          await sleep(15000);
        } else {
          failed++;
        }
      }
    }
    await sleep(3000); // small gap between jobs
  }
  console.log(`\n=== Done: ${success} success, ${failed} failed ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
