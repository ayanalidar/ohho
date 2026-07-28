import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const OUT = '/home/z/my-project/public/ohho-images';
const jobs = [
  { slug: 'ohho-cart-1', prompt: `A premium modern food cart kiosk with orange and gold branding, illuminated sign saying BURGERS, glass display counter, in a busy Indian street at dusk, professional commercial photography, vibrant`, size: '1344x768' },
  { slug: 'ohho-cart-2', prompt: `A sleek mobile food cart with orange branding, illuminated at night, serving burgers, with a small queue of customers, urban Indian setting, professional photography`, size: '1344x768' },
  { slug: 'ohho-cart-3', prompt: `A premium food cart interior view, clean stainless steel, brand sign, grill station, professional QSR photography, warm lighting`, size: '1344x768' },
  { slug: 'hero-burger', prompt: `Cinematic hero shot of an OHHO special double chicken burger, melted cheese dripping, dark dramatic background with orange glow, steam rising, premium QSR advertising photography, ultra detailed`, size: '1440x720' },
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
