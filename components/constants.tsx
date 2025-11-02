

import React from 'react';
import { IconType } from '../types';

export const ICONS: Record<string, React.ReactNode> = {
  // --- Generic & Vendor ---
  [IconType.User]: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
  [IconType.WebServer]: <path d="M20 15v-2h-2V7h2V5h-4V3h-2v2h-4V3H8v2H4v2h2v6H4v2H2v2h2v-2h2v2h12v-2h2v2h2v-2h-2zm-4-2H8V7h8v6z" />,
  [IconType.Api]: <path d="M7 15h2V9H7v6zm4 0h2V9h-2v6zm4-10h-2V3h2v2zm-8-2v2H5V3h2zM7 21h10v-2H7v2z" />,
  [IconType.Mobile]: <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />,
  [IconType.WebApp]: <path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H5V8h14v10z" />,
  [IconType.LoadBalancer]: <path d="M20 18H4v-2h16v2zm0-5H4V9h16v4zm0-7H4V4h16v2z" />,
  [IconType.Cache]: <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 2h8V3h-8v8zm2-6h4v4h-4V5zM3 21h8v-8H3v8zm2-6h4v4H5v-2z" />,
  [IconType.Cloud]: <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>,
  [IconType.Generic]: <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" />,

  // --- Databases ---
  [IconType.Database]: <path d="M12 3C7.03 3 3 5.36 3 8.25v7.5C3 18.64 7.03 21 12 21s9-2.36 9-5.25v-7.5C21 5.36 16.97 3 12 3zm0 16c-3.87 0-7-1.79-7-4v-1.52c1.22.86 3.89 1.52 7 1.52s5.78-.66 7-1.52V15c0 2.21-3.13 4-7 4zm0-6c-3.87 0-7-1.79-7-4s3.13-4 7-4 7 1.79 7 4-3.13 4-7 4z" />,
  [IconType.VectorDatabase]: <path d="M4 15h16v2H4zm0-4h16v2H4zm0-4h16v2H4zm8-4l-6 6h12z" />,

  // --- AI/ML ---
  [IconType.Brain]: <path d="M9 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H9z m-2 3H5v2h2v-2z m12 0h-2v2h2v-2z M12 4c-1.1 0-2 .9-2 2v2h4V6c0-1.1-.9-2-2-2z m0 14c1.1 0 2-.9 2-2v-2h-4v2c0 1.1.9 2 2 2z" />,
  [IconType.Llm]: <path d="M9 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H9z m-2 3H5v2h2v-2z m12 0h-2v2h2v-2z M12 4c-1.1 0-2 .9-2 2v2h4V6c0-1.1-.9-2-2-2z m0 14c1.1 0 2-.9 2-2v-2h-4v2c0 1.1.9 2 2 2z" />,
  [IconType.Gpu]: <path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z" />,
  [IconType.Gemini]: <path d="M12 2l2.12 7.88L22 12l-7.88 2.12L12 22l-2.12-7.88L2 12l7.88-2.12L12 2z" />,
  [IconType.EmbeddingModel]: <path d="M11 17h2v-4h-2v4zm-4 0h2v-4H7v4zm8 0h2v-4h-2v4zM7 5v2h10V5H7z" />,
  [IconType.KnowledgeBase]: <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm6 16H9v-2h6v2zm-3-4h-2v-2h2v2zm-2-4V8h4v4h-4z" />,
  [IconType.Neuron]: <circle cx="12" cy="12" r="12" />,
  [IconType.LayerLabel]: <></>,

  // --- Cloud Providers ---
  [IconType.AwsEc2]: <path d="M4 4h16v16H4z M6 6h12v12H6z M8 8h8v2H8z M8 12h8v2H8z" />,
  [IconType.AwsS3]: <path d="M5 8h14v10H5z M19 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2z" />,
  [IconType.AwsRds]: <path d="M12 2c-4.42 0-8 1.79-8 4v12c0 2.21 3.58 4 8 4s8-1.79 8-4V6c0-2.21-3.58-4-8-4zm0 18c-3.31 0-6-1.34-6-3V7.62c1.1.81 3.2 1.38 6 1.38s4.9-.57 6-1.38V17c0 1.66-2.69 3-6 3z" />,
  [IconType.AwsLambda]: <path d="M10 20.44L3.44 13.88L5.56 11.76L10 16.2L18.44 7.76L20.56 9.88L10 20.44Z" />,
  [IconType.AwsApiGateway]: <path d="M18 4H6V2H18V4ZM18 22H6V20H18V22ZM21 9H3V7H21V9ZM21 17H3V15H21V17ZM20 13H4V11H20V13Z" />,
  [IconType.AzureVm]: <path d="M5 3h14v18H5z M7 5h10v14H7z M9 7h6v2H9z M9 11h6v2H9z M9 15h6v2H9z" />,
  [IconType.GcpComputeEngine]: <path d="M4 4h16v2H4z M4 9h16v2H4z M4 14h16v2H4z M4 19h16v2H4z" />,
  [IconType.GcpCloudStorage]: <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />,

  // --- Containers & DevOps ---
  [IconType.Kubernetes]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm-1 8.5v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3zM12 16.5l5-2.8v3.3l-5 2.8v-3.3z" />,
  [IconType.Docker]: <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.19 2.58 7.78 6.2 9.25.13.03.26 0 .38-.06.12-.06.22-.16.27-.28.05-.12.05-.25.01-.38a.5.5 0 00-.36-.37c-.12-.05-2.82-.9-2.82-3.23h5.21v-1.5H5.69c0-2.34 2.7-3.18 2.82-3.23a.5.5 0 00.37-.36c.13-.13-.12-.3-.02-.42-.13-.13-.3-.12-.42.02-1.03.4-3.17 1.4-3.17 4.98h-1.5c.01-5.05 4.02-9.25 9-9.25s8.99 4.2 9 9.25h-1.5c0-3.58-2.14-4.58-3.17-4.98-.12-.05-.29-.04-.42.02-.14.12-.15.3-.02.42.05.12.15.22.27.28.12.05 2.82.9 2.82 3.23H13v1.5h5.31c0 2.34-2.7 3.18-2.82-3.23a.5.5 0 00-.37.36c-.13.13-.12.3.02.42.13.13.3.12.42-.02 1.03-.4 3.17-1.4 3.17-4.98h-1.5z" />,

  // --- Security ---
  [IconType.Firewall]: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />,
  [IconType.AuthService]: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2zm0 4h2v6h-2z" />,
  [IconType.SecretsManager]: <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />,

  // --- Other Icons from original list for completeness ---
  [IconType.Kafka]: <path d="M10 9.1L6 5v14l4-4.1V9.1z m8 5.8l4 4V5l-4 4.1v5.8z m-2-5.8L12 5v14l4-4.1V9.1z" />,
  [IconType.Monitoring]: <path d="M16 4H8C6.9 4 6 4.9 6 6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H9V8h6v10z M7 18v-2h10v2H7z" />,
  [IconType.Logging]: <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H4v-2h4v2zm0-4H4v-2h4v2zm8 4h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4H4V7h16v2z" />,
  [IconType.Playground]: <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />,
  [IconType.FileCode]: <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 13h-2v-2h2v2zm0-4h-2v-2h2v2zm-4-4H7v-2h2v2z" />,
  [IconType.Message]: <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />,
  [IconType.Sparkles]: <path d="M12 2c-.55 0-1 .45-1 1v4.44c-1.31-.77-2.78-1.02-4.14-.59-1.81.56-3.06 2.32-3.06 4.15 0 .23.02.46.06.69L2 12l1.86.01c.23.04.46.06.69.06 1.83 0 3.59-1.25 4.15-3.06.43-1.36.18-2.83-.59-4.14H11c.55 0 1-.45 1-1zm6.14 3.41c-.43-1.36-.18-2.83.59-4.14H17c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1v4.44c1.31-.77 2.78-1.02 4.14-.59 1.81.56 3.06 2.32 3.06 4.15 0 .23-.02.46-.06.69L22 12l-1.86.01c-.23.04-.46.06-.69.06-1.83 0-3.59-1.25-4.15-3.06zM12 14c.55 0 1-.45 1-1v-4.44c1.31.77 2.78 1.02 4.14.59 1.81-.56 3.06-2.32 3.06-4.15 0-.23-.02-.46-.06-.69L22 12l-1.86-.01c-.23-.04-.46-.06-.69-.06-1.83 0-3.59 1.25-4.15 3.06-.43 1.36-.18 2.83.59 4.14H13c-.55 0-1 .45-1 1z" />,
  [IconType.Edit]: <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />,
  [IconType.Gear]: <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />,
};

export const EXAMPLE_PROMPT = "Design a RAG (Retrieval-Augmented Generation) system for a customer support chatbot. It should take user questions, use an embedding model to find relevant documents in a vector database, and then feed that context to a Gemini LLM to generate an answer.";

export const EXAMPLE_PROMPTS_LIST = [
    EXAMPLE_PROMPT,
    "A 3-tier web application on AWS with a load balancer, multiple EC2 instances in an auto-scaling group, and an RDS database.",
    "A serverless API on GCP using Cloud Functions, API Gateway, and Firestore for the database.",
    "A simple neural network with 2 input neurons, one hidden layer of 3 neurons, and 1 output neuron."
];

export const FOOTER_LINKS = {
  socials: [
    { name: 'GitHub', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
    { name: 'LinkedIn', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
    { name: 'Google', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>},
  ],
  links: [
    { name: 'About', href: '#' },
    { name: 'SDK', href: '#' },
    { name: 'Docs', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
};

export const TESTIMONIALS = [
  {
    quote: "ArchiGen AI has become an indispensable tool. We now go from concept to a shareable diagram in minutes, not hours. It's a game-changer for rapid prototyping.",
    name: 'Sarah Chen',
    role: 'Lead Software Architect',
    company: 'Innovate Inc.',
    avatar: 'SC',
    logoText: 'InnovateInc'
  },
  {
    quote: "The ability to generate a baseline architecture and then jump into a playground to refine it is brilliant. It automates the tedious parts and lets us focus on creative design.",
    name: 'Maria Rodriguez',
    role: 'Senior DevOps Engineer',
    company: 'CloudFlow Solutions',
    avatar: 'MR',
    logoText: 'CloudFlow'
  },
  {
    quote: "As a product manager, I can now quickly create and iterate on architecture diagrams with my engineering team, which has massively improved our communication.",
    name: 'Emily White',
    role: 'Product Manager',
    company: 'NextGen Apps',
    avatar: 'EW',
    logoText: 'NextGen'
  },
  {
    quote: "As a student, understanding complex cloud architectures was daunting. ArchiGen makes it visual and interactive. I'm learning faster and creating portfolio-worthy projects.",
    name: 'David Kim',
    role: 'CS Student',
    company: 'State University',
    avatar: 'DK',
    logoText: 'University'
  },
  {
    quote: "This is the first tool that truly understands what I mean. I described a complex event-driven system, and it produced a near-perfect diagram on the first try.",
    name: 'Michael B.',
    role: 'Staff Engineer',
    company: 'DataStream',
    avatar: 'MB',
    logoText: 'DataStream'
  },
  {
    quote: "We use ArchiGen for client presentations. The diagrams are clean, professional, and easy to understand. It has elevated the quality of our proposals.",
    name: 'Jessica Lee',
    role: 'Solutions Consultant',
    company: 'TechPro Services',
    avatar: 'JL',
    logoText: 'TechPro'
  },
  {
    quote: "We've integrated ArchiGen into our onboarding for new engineers. It's the fastest way for them to understand our complex microservices architecture.",
    name: 'John Williams',
    role: 'Head of Platform Engineering',
    company: 'ScaleGrid',
    avatar: 'JW',
    logoText: 'ScaleGrid'
  },
  {
    quote: "Describing our blockchain infrastructure and getting a clear, accurate diagram in return is incredible. This tool has saved us countless hours of manual diagramming.",
    name: 'Alex Lee',
    role: 'CTO',
    company: 'FinTech Innovations',
    avatar: 'AL',
    logoText: 'FinTech'
  },
  {
    quote: "The AI's ability to create nested containers for regions and availability zones is top-notch. It produces diagrams that are ready for client-facing presentations.",
    name: 'Rachel Brown',
    role: 'Cloud Solutions Architect',
    company: 'Azure Dynamics',
    avatar: 'RB',
    logoText: 'AzureDynamics'
  },
  {
    quote: "The playground mode is fantastic for brainstorming sessions. We can quickly iterate on different API designs with the whole team watching in real-time.",
    name: 'Tom Miller',
    role: 'Engineering Manager',
    company: 'MobileFirst Co.',
    avatar: 'TM',
    logoText: 'MobileFirst'
  }
];