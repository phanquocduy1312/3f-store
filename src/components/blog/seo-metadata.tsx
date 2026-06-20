import React, { useEffect } from "react";
import { type BlogPost } from "@/src/api/blogApi";

interface SeoMetadataProps {
  post: BlogPost;
}

export function SeoMetadata({ post }: SeoMetadataProps) {
  useEffect(() => {
    if (!post) return;

    // 1. Title
    const titleVal = post.seo_title || post.title;
    const originalTitle = document.title;
    document.title = `${titleVal} | 3F Store - Cửa Hàng Thú Cưng`;

    // Helper to set or create meta tag
    const setMetaTag = (attr: "name" | "property", name: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // 2. Meta description & keywords
    const descVal = post.seo_description || post.summary || "";
    setMetaTag("name", "description", descVal);
    
    if (post.seo_keywords) {
      setMetaTag("name", "keywords", post.seo_keywords);
    }

    // 3. Open Graph
    const canonicalUrl = window.location.href;
    setMetaTag("property", "og:title", titleVal);
    setMetaTag("property", "og:description", descVal);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", "article");
    if (post.thumbnail_url) {
      setMetaTag("property", "og:image", post.thumbnail_url);
    }

    // 4. Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // 5. JSON-LD Structured Data
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${canonicalUrl}#blogposting`,
          "mainEntityOfPage": canonicalUrl,
          "headline": post.title,
          "description": descVal,
          "image": post.thumbnail_url || "https://3fstore.vn/assets/images/cat-food.webp",
          "datePublished": post.published_at || post.created_at,
          "dateModified": post.updated_at || post.published_at || post.created_at,
          "author": {
            "@type": "Person",
            "name": post.author || "Admin"
          },
          "publisher": {
            "@type": "Organization",
            "name": "3F Store",
            "logo": {
              "@type": "ImageObject",
              "url": "https://3fstore.vn/assets/logo/logo.webp"
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Trang chủ",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Tin tức",
              "item": `${window.location.origin}/tin-tuc`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": post.title,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    let scriptTag = document.getElementById("blog-structured-data") as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "blog-structured-data";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schema);

    // Cleanup
    return () => {
      document.title = originalTitle;
      const scriptEl = document.getElementById("blog-structured-data");
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, [post]);

  return null;
}
