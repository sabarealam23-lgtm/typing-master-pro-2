import React, { useEffect } from 'react';
import { PageRoute } from '../../types';
import { getBaseUrl, getCanonicalUrl, SITE_ROUTES, siteConfig } from '../../config/site';

interface SEOHeadProps {
  currentPage: PageRoute;
  customTitle?: string;
  customDescription?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  currentPage,
  customTitle,
  customDescription
}) => {
  useEffect(() => {
    // Determine route metadata
    const routeKey = currentPage === 'home' ? '' : currentPage;
    const matchedRoute = SITE_ROUTES.find(r => r.path === routeKey);

    const title = customTitle || matchedRoute?.title || `${siteConfig.name} | Professional Touch Typing Platform`;
    const description = customDescription || matchedRoute?.description || siteConfig.description;
    const canonicalUrl = getCanonicalUrl(routeKey);
    const baseUrl = getBaseUrl();
    const ogImageUrl = `${baseUrl}/og-image.png`;

    // 1. Update Title
    document.title = title;

    // 2. Update/create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update/create Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Helper to safely set Open Graph / Twitter meta tags
    const setMetaTag = (attrName: 'property' | 'name', attrVal: string, content: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 4. Update Open Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', siteConfig.name);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:image', ogImageUrl);

    // 5. Update Twitter Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', canonicalUrl);
    setMetaTag('name', 'twitter:image', ogImageUrl);

  }, [currentPage, customTitle, customDescription]);

  return null;
};
