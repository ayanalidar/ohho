import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const STYLE = "professional food photography, dark moody background, warm dramatic lighting, closeup, 45 degree angle, shallow depth of field, ultra detailed, high quality, premium QSR brand aesthetic, vibrant orange and gold tones";
const OUT = '/home/z/my-project/public/ohho-images';
const jobs = [
  { slug: 'cold-coffee', prompt: `A tall glass of cold coffee with whipped cream, chocolate drizzle, chocolate chips, on a dark surface with condensation, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-cheese', prompt: `A small bowl of melted extra cheese sauce, golden yellow, with herbs sprinkled on top, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-patty', prompt: `A single crispy fried chicken patty, golden brown, on a dark surface, garnished with herbs, ${STYLE}`, size: '1024x1024' },
  { slug: 'extra-dips', prompt: `Three small dipping sauce bowls - mayo, ketchup, spicy - on a dark surface, ${STYLE}`, size: '1024x1024' },
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
