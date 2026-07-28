import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const STYLE = "professional food photography, dark moody background, warm dramatic lighting, closeup, 45 degree angle, shallow depth of field, ultra detailed, high quality, premium QSR brand aesthetic, vibrant orange and gold tones";
const OUT = '/home/z/my-project/public/ohho-images';
const jobs = [
  { slug: 'veg-supreme-pizza', prompt: `A vegetarian supreme pizza with bell peppers, onions, mushrooms, sweet corn, olives, melting cheese, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'classic-chicken-pizza', prompt: `A classic chicken pizza with seasoned chicken pieces, bell peppers, red onions, mozzarella cheese, golden crust, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'ohho-special-chicken-pizza', prompt: `A premium special chicken pizza loaded with seasoned chicken, green peppers, red paprika rings, extra cheese, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'supreme-chicken-pizza', prompt: `A luxurious supreme chicken pizza with double chicken, premium cheese blend, herbs, paprika, on a dark surface, ${STYLE}`, size: '1024x1024' },
];
(async () => {
  const zai = await ZAI.create();
  for (const j of jobs) {
    const p = `${OUT}/${j.slug}.png`;
    if (fs.existsSync(p)) { console.log('SKIP', j.slug); continue; }
    try {
      console.log('GEN', j.slug);
      const r = await zai.images.generations.create({ prompt: j.prompt, size: j.size as any });
      fs.writeFileSync(p, Buffer.from(r.data[0].base64, 'base64'));
      console.log('OK', j.slug);
    } catch (e: any) { console.error('FAIL', j.slug, e.message); }
  }
})();
