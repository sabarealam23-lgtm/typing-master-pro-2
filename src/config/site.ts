/**
 * Site configuration and SEO utilities for SmartTypingPro
 * 
 * Supports dynamic environment-aware base URL:
 * - Reads NEXT_PUBLIC_SITE_URL or VITE_SITE_URL from environment variables
 * - Defaults gracefully to https://smarttypingpro.vercel.app
 * - When custom domains are configured in Vercel or deployment platforms,
 *   updating NEXT_PUBLIC_SITE_URL automatically updates canonical tags,
 *   sitemap, and Open Graph previews without editing code.
 */

// Safe retrieval of environment variable across Vite (client) and Node/SSR/Vercel environments
export const getBaseUrl = (): string => {
  let rawUrl = '';

  // Check Vite client-side env
  const importMetaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  if (importMetaEnv) {
    rawUrl = importMetaEnv.VITE_SITE_URL || 
             importMetaEnv.NEXT_PUBLIC_SITE_URL || 
             '';
  }

  // Check Node / process.env if available
  if (!rawUrl && typeof process !== 'undefined' && process.env) {
    const processEnv = process.env as Record<string, string | undefined>;
    rawUrl = processEnv.NEXT_PUBLIC_SITE_URL || 
             processEnv.VITE_SITE_URL || 
             processEnv.SITE_URL || 
             '';
  }

  const finalUrl = rawUrl.trim() || 'https://smarttypingpro.vercel.app';
  return finalUrl.replace(/\/+$/, '');
};

export const SITE_URL = getBaseUrl();

export interface SitemapRouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  title: string;
  description: string;
}

export const SITE_ROUTES: SitemapRouteConfig[] = [
  {
    path: '',
    priority: 1.0,
    changefreq: 'daily',
    title: 'SmartTypingPro | Professional Touch Typing Platform',
    description: 'Master fast, accurate touch typing with structured lessons, real-time analytics, Sonma-style typing tests, achievements, and certification.'
  },
  {
    path: 'practice',
    priority: 0.9,
    changefreq: 'weekly',
    title: 'Typing Practice Arena | SmartTypingPro',
    description: 'Practice touch typing with customizable text modes, words, sentences, blind typing, and instant visual keyboard guidance.'
  },
  {
    path: 'learn',
    priority: 0.9,
    changefreq: 'weekly',
    title: 'Typing Lessons & Courses | SmartTypingPro',
    description: 'Structured step-by-step touch typing courses from Home Row fundamentals to advanced numbers, symbols, and punctuation.'
  },
  {
    path: 'typing-test',
    priority: 0.9,
    changefreq: 'weekly',
    title: 'Speed Typing Test & Certification | SmartTypingPro',
    description: 'Official timed typing tests (1m, 3m, 5m, 10m) and Sonma-style exam arena with accurate Net WPM calculation and printable certificates.'
  },
  {
    path: 'leaderboard',
    priority: 0.7,
    changefreq: 'daily',
    title: 'Global Typing Leaderboard | SmartTypingPro',
    description: 'Compete with typists worldwide across multiple time categories, view top speeds, accuracy rankings, and tier standings.'
  },
  {
    path: 'achievements',
    priority: 0.7,
    changefreq: 'weekly',
    title: 'Typing Achievements & Badges | SmartTypingPro',
    description: 'Unlock typing milestones, speed achievements, accuracy badges, and track your daily streak progression.'
  },
  {
    path: 'dashboard',
    priority: 0.7,
    changefreq: 'daily',
    title: 'User Typing Dashboard | SmartTypingPro',
    description: 'View your personal typing statistics, progress charts, lesson completions, and recent test results.'
  },
  {
    path: 'progress',
    priority: 0.7,
    changefreq: 'weekly',
    title: 'Typing Analytics & Weak Key Analysis | SmartTypingPro',
    description: 'Deep analytics on your typing speed trends, error heatmaps, and personalized finger accuracy diagnostics.'
  },
  {
    path: 'about',
    priority: 0.5,
    changefreq: 'monthly',
    title: 'About SmartTypingPro | Modern Touch Typing Master',
    description: 'Learn about SmartTypingPro mission, touch typing pedagogy, scientific methodology, and development history.'
  },
  {
    path: 'privacy',
    priority: 0.5,
    changefreq: 'monthly',
    title: 'Privacy Policy | SmartTypingPro',
    description: 'Privacy policy and data protection commitments for SmartTypingPro users.'
  },
  {
    path: 'terms',
    priority: 0.5,
    changefreq: 'monthly',
    title: 'Terms of Service | SmartTypingPro',
    description: 'Terms of service and usage conditions for the SmartTypingPro typing web platform.'
  },
  {
    path: 'contact',
    priority: 0.5,
    changefreq: 'monthly',
    title: 'Contact Us | SmartTypingPro',
    description: 'Get in touch with the SmartTypingPro support team for feedback, enterprise inquiries, and bug reports.'
  }
];

export const siteConfig = {
  name: 'Smart Typing Pro',
  shortName: 'SmartTyping',
  description: 'Professional browser-based typing learning and practice web platform with structured courses, accurate WPM/Accuracy typing engine, visual keyboard, detailed analytics, achievements, and leaderboards.',
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/og-image.png`,
  creator: 'SmartTypingPro Team',
  keywords: [
    'typing practice',
    'touch typing',
    'typing test',
    'WPM speed test',
    'Sonma typing',
    'typing tutor',
    'learn typing',
    'keyboard speed',
    'typing certificate'
  ],
  routes: SITE_ROUTES
};

/**
 * Returns a fully-qualified canonical URL for a given route path or hash
 */
export const getCanonicalUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.replace(/^[/#]+/, '').replace(/\/+$/, '');
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

/**
 * Helper to generate XML sitemap format dynamically
 */
export const generateSitemapXml = (customBaseUrl?: string): string => {
  const base = (customBaseUrl || getBaseUrl()).replace(/\/+$/, '');
  const lastmod = new Date().toISOString().split('T')[0];

  const urlEntries = SITE_ROUTES.map((route) => {
    const loc = route.path ? `${base}/${route.path}` : base;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

/**
 * Helper to generate robots.txt format dynamically
 */
export const generateRobotsTxt = (customBaseUrl?: string): string => {
  const base = (customBaseUrl || getBaseUrl()).replace(/\/+$/, '');
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Host
Host: ${base}

# Sitemaps
Sitemap: ${base}/sitemap.xml
`;
};
