import {z} from 'zod';

export const songSchema=z.object({
  id:z.string().min(1).max(160).regex(/^[a-zA-Z0-9-]+$/),
  title:z.string().trim().min(1).max(160),artist:z.string().max(160),
  language:z.enum(['English','Sinhala']),key:z.string().regex(/^(?:[A-G][#b]?m?)?$/),
  content:z.string().max(100000),
  source:z.string().max(2000).refine(s=>!s||/^https?:\/\//.test(s),'Use an http or https link'),
  transpose:z.number().int().min(-48).max(48),favorite:z.boolean(),
  capo:z.number().int().min(0).max(12).default(0),updatedAt:z.number().finite().optional(),
});
