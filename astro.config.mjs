import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://www.tamango.co',
  integrations: [tailwind(), sitemap(), robotsTxt()],
  vite: {
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    }
  }
});