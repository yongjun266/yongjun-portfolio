import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const cases = defineCollection({
  loader: file('src/data/cases.json'),
  schema: z.object({
    title: z.string(), shortTitle: z.string(), category: z.string(), number: z.string(),
    summary: z.string(), role: z.string(), period: z.string(), cover: z.string(), coverAlt: z.string(),
    source: z.string(), cardDescription: z.string().optional(), metrics: z.array(z.object({value:z.string(), label:z.string(), note:z.string()})),
    sections: z.array(z.object({id:z.string(), title:z.string(), paragraphs:z.array(z.string()),
      images:z.array(z.object({src:z.string(),alt:z.string(),caption:z.string(),kind:z.enum(['image','video']).default('image'),poster:z.string().optional()})).optional(),
      points:z.array(z.object({title:z.string(),text:z.string()})).optional()
    }))
  })
});
export const collections = { cases };
