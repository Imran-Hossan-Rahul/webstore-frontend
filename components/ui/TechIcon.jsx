"use client";
import React from 'react';
import { 
    SiReact, SiNodedotjs, SiFigma, SiAdobexd, SiVuedotjs, SiPython, SiMongodb, SiTensorflow,
    SiAngular, SiNextdotjs, SiExpress, SiDjango, SiFlask, SiFastapi, SiSpringboot,
    SiPostgresql, SiMysql, SiRedis, SiDocker, SiKubernetes, SiAmazonaws, SiMicrosoftazure, SiGooglecloud,
    SiTypescript, SiJavascript, SiCplusplus, SiCsharp, SiGo, SiRust, SiSwift, SiKotlin,
    SiFlutter, SiIonic, SiXamarin, SiUnity, SiUnrealengine,
    SiAdobephotoshop, SiAdobeillustrator, SiSketch, SiInvision, SiFramer, SiWebflow,
    SiGraphql, SiSocketdotio, SiWebrtc, SiFirebase, SiSupabase,
    SiTailwindcss, SiBootstrap, SiMui, SiChakraui, SiAntdesign,
    SiGit, SiGithub, SiGitlab, SiBitbucket, SiJira, SiTrello, SiNotion,
    SiWebpack, SiVite, SiBabel, SiEslint, SiPrettier, SiJest, SiCypress,
    SiTwilio, SiVercel, SiNetlify
} from "react-icons/si";
import { FaJava, FaNetworkWired } from "react-icons/fa";
import { Code2 } from "lucide-react";

export const techIconMap = {
    "react": SiReact,
    "node.js": SiNodedotjs,
    "figma": SiFigma,
    "adobe xd": SiAdobexd,
    "vue.js": SiVuedotjs,
    "python": SiPython,
    "mongodb": SiMongodb,
    "tensorflow": SiTensorflow,
    "angular": SiAngular,
    "next.js": SiNextdotjs,
    "express": SiExpress,
    "django": SiDjango,
    "flask": SiFlask,
    "fastapi": SiFastapi,
    "spring boot": SiSpringboot,
    "postgresql": SiPostgresql,
    "mysql": SiMysql,
    "redis": SiRedis,
    "docker": SiDocker,
    "kubernetes": SiKubernetes,
    "aws": SiAmazonaws,
    "azure": SiMicrosoftazure,
    "gcp": SiGooglecloud,
    "typescript": SiTypescript,
    "javascript": SiJavascript,
    "java": FaJava,
    "c++": SiCplusplus,
    "c#": SiCsharp,
    "go": SiGo,
    "rust": SiRust,
    "swift": SiSwift,
    "kotlin": SiKotlin,
    "flutter": SiFlutter,
    "react native": SiReact, // Same as react
    "ionic": SiIonic,
    "xamarin": SiXamarin,
    "unity": SiUnity,
    "unreal engine": SiUnrealengine,
    "photoshop": SiAdobephotoshop,
    "illustrator": SiAdobeillustrator,
    "sketch": SiSketch,
    "invision": SiInvision,
    "framer": SiFramer,
    "webflow": SiWebflow,
    "graphql": SiGraphql,
    "rest api": FaNetworkWired,
    "socket.io": SiSocketdotio,
    "webrtc": SiWebrtc,
    "firebase": SiFirebase,
    "supabase": SiSupabase,
    "tailwind css": SiTailwindcss,
    "bootstrap": SiBootstrap,
    "material-ui": SiMui,
    "chakra ui": SiChakraui,
    "ant design": SiAntdesign,
    "git": SiGit,
    "github": SiGithub,
    "gitlab": SiGitlab,
    "bitbucket": SiBitbucket,
    "jira": SiJira,
    "trello": SiTrello,
    "notion": SiNotion,
    "webpack": SiWebpack,
    "vite": SiVite,
    "babel": SiBabel,
    "eslint": SiEslint,
    "prettier": SiPrettier,
    "jest": SiJest,
    "cypress": SiCypress,
    "twilio": SiTwilio,
    "sendgrid": SiTwilio, // fallback
    "vercel": SiVercel,
    "netlify": SiNetlify
};

// Returns just the icon for tech stack tags
export default function TechIcon({ tech, className = "", size = 16 }) {
    const name = (tech || "").toLowerCase().trim();
    const Icon = techIconMap[name];
    
    if (Icon) {
        return <Icon size={size} className={className} title={tech} />;
    }
    
    // Fallback: Return first letter or a generic icon
    return (
        <div 
            title={tech}
            className={`flex items-center justify-center font-bold font-mono border rounded ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.6 }}
        >
            {tech ? tech.charAt(0).toUpperCase() : <Code2 size={size * 0.7} />}
        </div>
    );
}
