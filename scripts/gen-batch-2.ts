import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const STYLE = "professional food photography, dark moody background, warm dramatic lighting, closeup, 45 degree angle, shallow depth of field, ultra detailed, high quality, premium QSR brand aesthetic, vibrant orange and gold tones";
const OUT = '/home/z/my-project/public/ohho-images';
const jobs = [
  { slug: 'classic-chicken-sandwich', prompt: `A classic grilled chicken sandwich with cheddar cheese, crisp veggies, on toasted sourdough bread, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'ohho-special-chicken-sandwich', prompt: `A double-stacked flame-grilled chicken sandwich with secret glaze, caramelized onions, on thick brioche bread, on a dark surface, ${STYLE}`, size: '1024x1024' },
  { slug: 'crispy-chicken-bucket-half', prompt: `A small bucket of crispy fried chicken pieces, golden brown, half full, on a dark surface with ketchup dip, ${STYLE}`, size: '1024x1024' },
  { slug: 'crispy-chicken-bucket-full', prompt: `A full bucket overflowing with crispy fried chicken pieces, golden brown, on a dark surface with dips, ${STYLE}`, size: '1024x1024' },
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
