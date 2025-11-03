

import React from 'react';
import { IconType } from '../types';

export const ICONS: Record<string, React.ReactNode> = {
  // --- Vibrant, Modern Cloud & Tech Icons ---

  // --- Generic & Conceptual ---
  [IconType.User]: <g><defs><linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6E8EFB"/><stop offset="100%" stopColor="#A483E2"/></linearGradient></defs><circle cx="12" cy="8" r="4.5" fill="url(#userGrad)"/><path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="url(#userGrad)"/></g>,
  [IconType.Database]: <g><defs><linearGradient id="dbGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#8A2BE2"/><stop offset="100%" stopColor="#4A00E0"/></linearGradient></defs><path d="M12 7C6.48 7 2 8.79 2 11v8c0 2.21 4.48 4 10 4s10-1.79 10-4v-8c0-2.21-4.48-4-10-4z" fill="url(#dbGrad)"/><ellipse cx="12" cy="11" rx="10" ry="4" fill="#E6E6FA" opacity="0.8"/><path d="M2 11v4c0 2.21 4.48 4 10 4s10-1.79 10-4v-4c0 2.21-4.48 4-10 4s-10-1.79-10-4z" fill="black" opacity="0.2"/></g>,
  [IconType.WebServer]: <g><defs><linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#434343"/><stop offset="100%" stopColor="#000000"/></linearGradient></defs><rect x="4" y="4" width="16" height="16" rx="2" fill="url(#serverGrad)"/><path d="M6 8h12v2H6zm0 4h12v2H6zm0 4h8v2H6z" fill="#333"/><circle cx="17" cy="16" r="1" fill="#2ECC71"/></g>,
  [IconType.Api]: <g><defs><linearGradient id="apiGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00c6ff"/><stop offset="100%" stopColor="#0072ff"/></linearGradient></defs><path d="M13 7h-2v10h2V7zm-8 0H3v10h2V7zm10 0h-2v10h2V7z M8 4h8v2H8z m0 14h8v2H8z" fill="url(#apiGrad)"/></g>,
  [IconType.Mobile]: <g><defs><linearGradient id="mobileGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient></defs><rect x="6" y="2" width="12" height="20" rx="2" fill="url(#mobileGrad)"/><rect x="7" y="3" width="10" height="14" fill="#fff"/><circle cx="12" cy="20" r="1" fill="#fff"/></g>,
  [IconType.WebApp]: <g><defs><linearGradient id="webappGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#56CCF2"/><stop offset="100%" stopColor="#2F80ED"/></linearGradient></defs><rect x="3" y="5" width="18" height="14" rx="2" fill="url(#webappGrad)"/><path d="M3 8h18v2H3z" fill="rgba(255,255,255,0.3)"/><circle cx="6" cy="7" r="1" fill="white"/><circle cx="9" cy="7" r="1" fill="white"/><circle cx="12" cy="7" r="1" fill="white"/></g>,
  [IconType.LoadBalancer]: <g><defs><linearGradient id="lbGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F2994A"/><stop offset="100%" stopColor="#F2C94C"/></linearGradient></defs><path d="M12 2L2 7h20L12 2zm0 18l10 5H2l10-5z" fill="url(#lbGrad)"/><path d="M4 8h16v8H4V8zm2 2v4h4v-4H6zm6 0v4h4v-4h-4z" fill="#fff" opacity="0.8"/></g>,
  [IconType.Cache]: <g><defs><linearGradient id="cacheGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2AF598"/><stop offset="100%" stopColor="#009EFD"/></linearGradient></defs><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm-1 14H7v-4h4v4zm0-6H7V6h4v4zm6 6h-4v-4h4v4zm0-6h-4V6h4v4z" fill="url(#cacheGrad)"/></g>,
  [IconType.Cloud]: <g><defs><linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4A90E2"/><stop offset="100%" stopColor="#50E3C2"/></linearGradient></defs><path d="M17.5 10.5a5.5 5.5 0 1 0-9.8 3.5h7.3a4.5 4.5 0 1 0 2.5-3.5z" fill="url(#cloudGrad)"/><path d="M6.5 13.5a4.5 4.5 0 1 1 8.9 1" fill="url(#cloudGrad)" opacity="0.8"/></g>,

  // --- AWS ---
  [IconType.AwsEc2]: <g><defs><linearGradient id="awsEc2Grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF9900"/><stop offset="100%" stopColor="#F58500"/></linearGradient></defs><path d="M4 6l8-4 8 4v12l-8 4-8-4V6z m8 14l8-4V6l-8-4-8 4v12l8 4z" fill="rgba(0,0,0,0.2)"/><path d="M4 6l8-4 8 4v12l-8 4-8-4V6z" fill="url(#awsEc2Grad)"/><path d="M4 6v12l8 4V10L4 6zm8-4l8 4-8 4-8-4 8-4zm8 4v12l-8 4V10l8-4z" fill="black" opacity="0.15"/></g>,
  [IconType.AwsS3]: <g><defs><linearGradient id="awsS3Grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#56B9D0"/><stop offset="100%" stopColor="#3A9AB4"/></linearGradient></defs><path d="M5 8h14v10H5z M19 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2z" fill="url(#awsS3Grad)"/><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2" fill="rgba(255,255,255,0.4)"/></g>,
  [IconType.AwsRds]: <g><defs><linearGradient id="awsRdsGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2E73B8"/><stop offset="100%" stopColor="#1C4973"/></linearGradient></defs><path d="M12 4c-4.42 0-8 1.79-8 4s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z" fill="#fff" opacity="0.7"/><path d="M12 4C7.58 4 4 5.79 4 8s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zm0 16c4.42 0 8-1.79 8-4s-3.58-4-8-4-8 1.79-8 4 3.58 4 8 4z" fill="url(#awsRdsGrad)"/><path d="M4 12v4c0 2.21 3.58 4 8 4s8-1.79 8-4v-4c0 2.21-3.58 4-8 4s-8-1.79-8-4z" fill="url(#awsRdsGrad)"/></g>,
  [IconType.AwsLambda]: <g><defs><linearGradient id="awsLambdaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F58536"/><stop offset="100%" stopColor="#D86613"/></linearGradient></defs><path d="M10 20.44L3.44 13.88 2 15.32l8 8 11.12-11.12L19.7 10.76 10 20.44z" fill="rgba(0,0,0,0.2)"/><path d="M10 20.44L3.44 13.88L5.56 11.76L10 16.2L18.44 7.76L20.56 9.88L10 20.44Z" fill="url(#awsLambdaGrad)"/></g>,

  // --- Azure ---
  [IconType.AzureVm]: <g><defs><linearGradient id="azureGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#0078D4"/><stop offset="100%" stopColor="#005A9E"/></linearGradient></defs><path d="M5 3h14v18H5z" fill="url(#azureGrad)"/><path d="M7 5h10v14H7z M9 7h6v2H9z M9 11h6v2H9z M9 15h3v2H9z" fill="#fff" opacity="0.8"/></g>,
  [IconType.AzureBlobStorage]: <g><defs><linearGradient id="azureBlobGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#0078D4"/><stop offset="100%" stopColor="#005A9E"/></linearGradient></defs><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" fill="url(#azureBlobGrad)"/></g>,

  // --- GCP ---
  [IconType.GcpComputeEngine]: <g><defs><linearGradient id="gcpGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="100%" stopColor="#3578E5"/></linearGradient></defs><rect x="4" y="4" width="16" height="16" rx="1" fill="url(#gcpGrad)"/><path d="M6 7h8v2H6zm0 4h12v2H6zm0 4h10v2H6z" fill="#fff" opacity="0.8"/></g>,
  [IconType.GcpCloudStorage]: <g><defs><linearGradient id="gcpStorageGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="100%" stopColor="#3578E5"/></linearGradient></defs><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="url(#gcpStorageGrad)"/><path d="M6 20c-3.31 0-6-2.69-6-6 0-3.09 2.34-5.64 5.35-5.96" fill="rgba(0,0,0,0.1)"/></g>,

  // --- Containers & Orchestration ---
  [IconType.Kubernetes]: <g><defs><linearGradient id="kubeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#326CE5"/><stop offset="100%" stopColor="#2D60CC"/></linearGradient></defs><path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2z m-1 8.5v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3z m-1 4.7v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3z" fill="url(#kubeGrad)"/></g>,
  [IconType.Docker]: <g><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.19 2.58 7.78 6.2 9.25.13.03.26 0 .38-.06.12-.06.22-.16.27-.28.05-.12.05-.25.01-.38a.5.5 0 00-.36-.37c-.12-.05-2.82-.9-2.82-3.23h5.21v-1.5H5.69c0-2.34 2.7-3.18 2.82-3.23a.5.5 0 00.37-.36c.13-.13.12-.3-.02-.42-.13-.13-.3-.12-.42.02-1.03.4-3.17 1.4-3.17 4.98h-1.5c.01-5.05 4.02-9.25 9-9.25s8.99 4.2 9 9.25h-1.5c0-3.58-2.14-4.58-3.17-4.98-.12-.05-.29-.04-.42.02-.14.12-.15.3-.02.42.05.12.15.22.27.28.12.05 2.82.9 2.82 3.23H13v1.5h5.31c0 2.34-2.7 3.18-2.82-3.23a.5.5 0 00-.37.36c-.13.13-.12.3.02.42.13.13.3.12.42-.02 1.03-.4 3.17-1.4 3.17-4.98h-1.5z" fill="#2496ED" /></g>,

  // --- AI / ML ---
  [IconType.Brain]: <g><defs><radialGradient id="brainGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stopColor="#FFC8DD"/><stop offset="100%" stopColor="#F472B6"/></radialGradient></defs><path d="M9 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H9z m-2 3H5v2h2v-2z m12 0h-2v2h2v-2z M12 4c-1.1 0-2 .9-2 2v2h4V6c0-1.1-.9-2-2-2z m0 14c1.1 0 2-.9 2-2v-2h-4v2c0 1.1.9 2 2 2z" fill="url(#brainGrad)"/></g>,
  [IconType.Llm]: <g><defs><linearGradient id="llmGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A855F7"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs><rect x="4" y="6" width="16" height="12" rx="2" fill="url(#llmGrad)"/><path d="M7 9h4m-4 2h10m-10 2h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/></g>,
  [IconType.VectorDatabase]: <g><defs><linearGradient id="vecGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#059669"/></linearGradient></defs><path d="M4 6l8-4 8 4v12l-8 4-8-4V6z m8 14l8-4V6l-8-4-8 4v12l8 4z" fill="rgba(0,0,0,0.2)"/><path d="M4 6l8-4 8 4v12l-8 4-8-4V6z" fill="url(#vecGrad)"/><path d="M4 6v12l8 4V10L4 6zm8-4l8 4-8 4-8-4 8-4zm8 4v12l-8 4V10l8-4z" fill="black" opacity="0.15"/><path d="M12 10l-4 2v4l4-2zm0 0l4 2v4l-4-2z" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5"/></g>,
  [IconType.Neuron]: <g><defs><radialGradient id="neuronGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#FBCFE8"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="#F472B6"/><circle cx="12" cy="12" r="10" fill="url(#neuronGrad)"/></g>,

  // --- Development & Web ---
  [IconType.Javascript]: <g><rect x="2" y="2" width="20" height="20" fill="#F7DF1E"/><path d="M9.82 17.54c.7 0 1.28-.22 1.7-.65s.63-1 .63-1.73c0-.6-.18-1.1-.53-1.5-.35-.4-.8-.6-1.35-.6-.56 0-1.02.2-1.38.6-.36.4-.54.9-.54 1.5 0 .73.2 1.34.6 1.8.4.48.95.73 1.63.73zm6.86-5.12c0 .76-.2 1.4-.6 1.9-.4.5-1 .75-1.75.75-.76 0-1.37-.25-1.84-.75-.47-.5-.7-1.14-.7-1.9 0-.78.23-1.43.7-1.95.47-.52 1.08-.78 1.84-.78.75 0 1.35.26 1.75.78.4.52.6 1.17.6 1.95z" fill="black" /></g>,
  [IconType.ReactJs]: <g fill="none" stroke="#61DAFB" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></g>,
  [IconType.NodeJs]: <path d="M12 2l9.526 5.5v11L12 24l-9.526-5.5v-11L12 2z M11.13 14.04l-3.34-1.93v-3.84l3.34 1.93v3.84z m1.74 0l3.34-1.93v-3.84l-3.34 1.93v3.84z m-1.74 4.48l-3.34-1.93v-3.84l3.34 1.93v3.84z" fill="#339933" />,
  [IconType.Python]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="#3776AB" /><path d="M12 22a10 10 0 100-20 10 10 0 000 20z M12 17.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#FFD43B" /></g>,
  [IconType.GoLang]: <g><circle cx="12" cy="8" r="4" fill="#00ADD8"/><circle cx="12" cy="16" r="4" fill="#00ADD8"/><path d="M8 8h8M8 16h8" stroke="white" strokeWidth="1.5"/></g>,
  
  // Stroke-based icons for UI elements - kept as they are for clarity
  [IconType.Playground]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" stroke="currentColor" fill="none"/>,
  [IconType.FileCode]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" fill="none" />,
  [IconType.Message]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" fill="none" />,
  [IconType.Sparkles]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" stroke="currentColor" fill="none" />,
  [IconType.Edit]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" fill="none"/>,
  [IconType.Gear]: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" fill="none" /></>,

  // Empty placeholders
  [IconType.LayerLabel]: <></>,
  [IconType.GroupLabel]: <></>,
  
  // --- Unchanged icons will fall back to Generic ---
  ...Object.fromEntries(Object.values(IconType).map(v => [v, <g><defs><linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="100%" stopColor="#7f8c8d"/></linearGradient></defs><rect x="4" y="4" width="16" height="16" rx="2" fill="url(#fallbackGrad)"/><rect x="6" y="6" width="12" height="12" rx="1" fill="#fff" opacity="0.3"/></g>])),
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
    quote: "CubeGen AI has become an indispensable tool. We now go from concept to a shareable diagram in minutes, not hours. It's a game-changer for rapid prototyping.",
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
    quote: "As a student, understanding complex cloud architectures was daunting. CubeGen makes it visual and interactive. I'm learning faster and creating portfolio-worthy projects.",
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
    quote: "We use CubeGen for client presentations. The diagrams are clean, professional, and easy to understand. It has elevated the quality of our proposals.",
    name: 'Jessica Lee',
    role: 'Solutions Consultant',
    company: 'TechPro Services',
    avatar: 'JL',
    logoText: 'TechPro'
  },
  {
    quote: "We've integrated CubeGen into our onboarding for new engineers. It's the fastest way for them to understand our complex microservices architecture.",
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
