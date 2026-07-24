"use client";
import React, { useState } from 'react';
import { Code2 } from "lucide-react";

export const techSlugMap = {
    "react": "react",
    "react native": "react",
    "node.js": "nodedotjs",
    "node": "nodedotjs",
    "figma": "figma",
    "adobe xd": "adobexd",
    "vue.js": "vuedotjs",
    "vue": "vuedotjs",
    "python": "python",
    "mongodb": "mongodb",
    "tensorflow": "tensorflow",
    "angular": "angular",
    "next.js": "nextdotjs",
    "next": "nextdotjs",
    "express": "express",
    "express.js": "express",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "spring boot": "springboot",
    "spring": "spring",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "mysql": "mysql",
    "redis": "redis",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "aws": "amazonaws",
    "amazon web services": "amazonaws",
    "azure": "microsoftazure",
    "gcp": "googlecloud",
    "google cloud": "googlecloud",
    "typescript": "typescript",
    "ts": "typescript",
    "javascript": "javascript",
    "js": "javascript",
    "java": "java",
    "c++": "cplusplus",
    "cpp": "cplusplus",
    "c#": "csharp",
    "csharp": "csharp",
    "go": "go",
    "golang": "go",
    "rust": "rust",
    "swift": "swift",
    "kotlin": "kotlin",
    "flutter": "flutter",
    "ionic": "ionic",
    "xamarin": "xamarin",
    "unity": "unity",
    "unreal engine": "unrealengine",
    "unreal": "unrealengine",
    "photoshop": "adobephotoshop",
    "illustrator": "adobeillustrator",
    "sketch": "sketch",
    "invision": "invision",
    "framer": "framer",
    "framer motion": "framer",
    "webflow": "webflow",
    "graphql": "graphql",
    "socket.io": "socketdotio",
    "webrtc": "webrtc",
    "firebase": "firebase",
    "supabase": "supabase",
    "tailwind css": "tailwindcss",
    "tailwind": "tailwindcss",
    "bootstrap": "bootstrap",
    "material-ui": "mui",
    "mui": "mui",
    "chakra ui": "chakraui",
    "ant design": "antdesign",
    "git": "git",
    "github": "github",
    "gitlab": "gitlab",
    "bitbucket": "bitbucket",
    "jira": "jira",
    "trello": "trello",
    "notion": "notion",
    "webpack": "webpack",
    "vite": "vite",
    "babel": "babel",
    "eslint": "eslint",
    "prettier": "prettier",
    "jest": "jest",
    "cypress": "cypress",
    "twilio": "twilio",
    "sendgrid": "sendgrid",
    "vercel": "vercel",
    "netlify": "netlify",
    "apollo": "apollographql",
    "prisma": "prisma",
    "php": "php",
    "laravel": "laravel",
    "ruby": "ruby",
    "rails": "rubyonrails",
    "ruby on rails": "rubyonrails",
    "svelte": "svelte",
    "redux": "redux",
    "linux": "linux",
    "ubuntu": "ubuntu",
    "bash": "gnubash",
    "html": "html5",
    "html5": "html5",
    "css": "css3",
    "css3": "css3",
    "sass": "sass",
    "less": "less",
    "deno": "deno",
    "bun": "bun",
    "nestjs": "nestjs",
    "nest.js": "nestjs",
    "android": "android",
    "ios": "ios",
    "apple": "apple",
    "windows": "windows",
    "dart": "dart",
    "sqlite": "sqlite",
    "mariadb": "mariadb",
    "oracle": "oracle",
    "kafka": "apachekafka",
    "rabbitmq": "rabbitmq",
    "nginx": "nginx",
    "apache": "apache",
    "digitalocean": "digitalocean",
    "heroku": "heroku",
    "cloudflare": "cloudflare",
    "stripe": "stripe",
    "paypal": "paypal",
    "discord": "discord",
    "slack": "slack",
    "zoom": "zoom",
    "wordpress": "wordpress",
    "shopify": "shopify",
    "magento": "magento",
    "wix": "wix",
    "squarespace": "squarespace"
};

// Returns original colored logo from CDN or fallback
export default function TechIcon({ tech, className = "", size = 16 }) {
    const [imgError, setImgError] = useState(false);
    const name = String(tech || "").toLowerCase().trim();
    
    // 1. Check exact map
    let slug = techSlugMap[name];
    let customUrl = null;

    // 2. Fuzzy matching for common complex names if not in exact map
    if (!slug) {
        if (name.includes('apollo')) slug = 'apollographql';
        else if (name.includes('react')) slug = 'react';
        else if (name.includes('node')) slug = 'nodedotjs';
        else if (name.includes('vue')) slug = 'vuedotjs';
        else if (name.includes('next')) slug = 'nextdotjs';
        else if (name.includes('tailwind')) slug = 'tailwindcss';
        else if (name.includes('aws') || name.includes('amazon')) {
            // SimpleIcons removed AWS, so we use a reliable Wikipedia SVG
            customUrl = "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg";
        }
        else if (name === 'api' || name.includes('api')) {
            slug = 'fastapi'; // Just something that looks like an API
        }
        else {
            // Guess the slug for unmapped tech (e.g. "three.js" -> "threedotjs")
            slug = name.replace(/\s+/g, '').replace(/\./g, 'dot').replace(/[^a-z0-9]/g, '');
        }
    }

    if (!imgError && (slug || customUrl)) {
        return (
            <img 
                src={customUrl || `https://cdn.simpleicons.org/${slug}`} 
                alt={tech} 
                title={tech}
                style={{ width: size, height: size }}
                className={`object-contain ${className}`}
                onError={() => setImgError(true)}
            />
        );
    }

    // Fallback if image fails or no slug exists
    return (
        <div 
            title={tech}
            className={`flex items-center justify-center font-bold font-mono border border-slate-200 dark:border-white/10 rounded bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.6 }}
        >
            {tech ? String(tech).charAt(0).toUpperCase() : <Code2 size={size * 0.7} />}
        </div>
    );
}
