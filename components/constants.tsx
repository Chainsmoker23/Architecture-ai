

import React from 'react';
import { IconType } from '../types';

const Duotone: React.FC<{ p1: string; p2: string; }> = ({ p1, p2 }) => (
  <>
    <path d={p1} fill="currentColor" opacity="0.4" />
    <path d={p2} fill="currentColor" />
  </>
);

export const ICONS: Record<string, React.ReactNode> = {
  // --- Redesigned Generic & Conceptual Icons (Duotone) ---
  [IconType.User]: <Duotone p1="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" p2="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />,
  [IconType.Database]: <Duotone p1="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4v5c0 2.21-3.58 4-8 4s-8-1.79-8-4v-5z" p2="M12 4c-4.42 0-8 1.79-8 4s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z" />,
  [IconType.WebServer]: <Duotone p1="M4 12h16v6H4z" p2="M4 6h16v6H4z" />,
  [IconType.Api]: <Duotone p1="M10 9h4v6h-4z" p2="M4 9h4v6H4zm12 0h4v6h-4z" />,
  [IconType.Mobile]: <Duotone p1="M7 4h10v14H7z" p2="M5 2h14v20H5z" />,
  [IconType.WebApp]: <Duotone p1="M4 9h16v9H4z" p2="M4 4h16v5H4z" />,
  [IconType.LoadBalancer]: <Duotone p1="M4 11h16v2H4z" p2="M9 5l3-3 3 3H9zm6 14l-3 3-3-3h6z" />,
  [IconType.Cache]: <Duotone p1="M12 8l4 4-4 4-4-4 4-4z" p2="M4 4h16v16H4z" />,
  [IconType.Cloud]: <Duotone p1="M6.5 13.5a4.5 4.5 0 1 1 8.9 1" p2="M17.5 10.5a5.5 5.5 0 1 0-9.8 3.5h7.3a4.5 4.5 0 1 0 2.5-3.5z" />,
  [IconType.Firewall]: <Duotone p1="M4 10h16v10H4z" p2="M5 6h14v4H5zm3-2h8v2H8z" />,
  [IconType.AuthService]: <Duotone p1="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" p2="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />,
  [IconType.SecretsManager]: <Duotone p1="M9 11.72V16h6v-4.28c-.6.17-1.25.28-2 .28s-1.4-.11-2-.28z" p2="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm5 12c-2.76 0-5 2.24-5 5v3h10v-3c0-2.76-2.24-5-5-5z" />,
  [IconType.Generic]: <Duotone p1="M8 8h8v8H8z" p2="M4 4h16v16H4z" />,
  [IconType.Brain]: <Duotone p1="M12 7.5c-1.24 0-2.39.42-3.29 1.13.43-.22.9-.38 1.4-.48-1.07 1.34-1.71 3.14-1.71 5.1s.64 3.76 1.71 5.1c-.5.1-1 .25-1.4.48.9.71 2.05 1.13 3.29 1.13 3.31 0 6-2.69 6-6s-2.69-6-6-6z" p2="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />,

  // --- Redesigned Cloud Vendor Icons (Duotone) ---
  [IconType.AwsEc2]: <Duotone p1="M6 6h12v12H6z" p2="M4 4h16v16H4z" />,
  [IconType.AwsS3]: <Duotone p1="M5 8h14v10H5z" p2="M19 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />,
  [IconType.AwsRds]: <Duotone p1="M4 12v5c0 2.21 3.58 4 8 4s8-1.79 8-4v-5c0 2.21-3.58 4-8 4s-8-1.79-8-4z" p2="M12 4C7.58 4 4 5.79 4 8s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z" />,
  [IconType.AwsLambda]: <Duotone p1="M8 9.88l-4.56 4L2 12.44 8 6.44l6 6-1.44 1.44z" p2="M16 17.56L8 9.56l-6 6V8.44l6-6 8 8 1.44-1.44 2 2L16 17.56z" />,
  [IconType.AwsApiGateway]: <Duotone p1="M6 11h12v2H6z" p2="M4 4h16v2H4zm2 15h12v2H6zm1-5h10v2H7z" />,
  [IconType.AwsLoadBalancer]: <Duotone p1="M4 11h16v2H4z" p2="M4 5h16v2H4zm0 12h16v2H4z" />,
  [IconType.AwsCloudfront]: <Duotone p1="M7 12l4-4-4-4" p2="M18 18H8v-2h8v-2h-5.5a2.5 2.5 0 0 1 0-5H18v10z" />,
  [IconType.AwsEcs]: <Duotone p1="M10 4h4v4h-4zm0 6h4v4h-4zm0 6h4v4h-4z" p2="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />,
  [IconType.AzureVm]: <Duotone p1="M7 5h10v14H7z" p2="M5 3h14v18H5z" />,
  [IconType.GcpComputeEngine]: <Duotone p1="M6 6h12v2H6zm0 5h12v2H6zm0 5h12v2H6z" p2="M4 4h16v16H4z" />,
  [IconType.Kubernetes]: <Duotone p1="M6.71 13.12l-1.83.91L4 12.18v-2.36l.88-.44 1.83.92v2.82zM12 14.24V17l5.12-2.56.88.44v2.36l-.88.44-5.12 2.56v-2.76l-5.12-2.56-.88-.44v-2.36l.88-.44 5.12 2.56z" p2="M12 2.48l6 3v1.64l-6 3-6-3V5.48l6-3zm5.12 9.7L12 9.36v2.82l5.12 2.56.88-.44v-2.36l-.88.44z" />,
  
  // Duotone Dev Icons
  [IconType.Javascript]: <Duotone p1="M2 2h20v20H2z" p2="M10 17.5c.7 0 1.3-.2 1.7-.6s.6-1 .6-1.7c0-.6-.2-1.1-.5-1.5s-.8-.6-1.4-.6c-.5 0-1 .2-1.3.6s-.5.9-.5 1.5c0 .7.2 1.3.6 1.8.4.5 1 .7 1.6.7zm6.8-5.1c0 .7-.2 1.4-.6 1.9-.4.5-1 .7-1.7.7-.8 0-1.4-.2-1.8-.7s-.7-1.1-.7-1.9c0-.8.2-1.4.7-1.9s1.1-.8 1.8-.8c.7 0 1.3.3 1.7.8.4.5.6 1.1.6 1.9z" />,
  [IconType.ReactJs]: <Duotone p1="M12 2a10 10 0 0 0-3.78 19.4 10 10 0 0 0 7.56 0A10 10 0 0 0 12 2z" p2="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  [IconType.NodeJs]: <Duotone p1="M12 4.43L4.93 8.25v7.5L12 19.57l7.07-3.82v-7.5L12 4.43zM9.5 13.9v-3.8l3 1.73v3.8l-3-1.73z" p2="M11.25 3.43L3.43 7.75v8.5l7.82 4.32 7.82-4.32v-8.5L12.75 3.43h-1.5z" />,

  // Other Duotone Icons
  [IconType.Docker]: <Duotone p1="M8 12h8v2H8z" p2="M21 12.53V9h-3V6h-3V4h-6v2H6v3H3v3.53l1.94 1.54c.31.25.75.25.96 0L8 12.53h8l2.1 1.54c.21.25.65.25.96 0L21 12.53z" />,
  [IconType.Monitoring]: <Duotone p1="M9 8h6v10H9z" p2="M18 6v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2z" />,
  [IconType.Logging]: <Duotone p1="M4 7h16v2H4z" p2="M4 11h10v2H4zm0 4h10v2H4zm12-4h4v6h-4z" />,
  [IconType.VectorDatabase]: <Duotone p1="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4v5c0 2.21-3.58 4-8 4s-8-1.79-8-4v-5z" p2="M12 4c-4.42 0-8 1.79-8 4s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z" />,
  [IconType.Llm]: <Duotone p1="M10 8h4v8h-4z" p2="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z" />,
  [IconType.EmbeddingModel]: <Duotone p1="M4 9h4v6H4zm12 0h4v6h-4z" p2="M10 9h4v6h-4z" />,
  [IconType.PromptManager]: <Duotone p1="M9 11h6v2H9zm0 4h6v2H9z" p2="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />,
  [IconType.KnowledgeBase]: <Duotone p1="M9 8h6v2H9zm0 4h6v2H9z" p2="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />,
  [IconType.DataPreprocessing]: <Duotone p1="M10 4h4v4h-4z" p2="M3 4l9 9 9-9-9 9z" />,
  [IconType.Gpu]: <Duotone p1="M10 8h4v8h-4z" p2="M6 4h12v16H6z" />,
  [IconType.Neuron]: <Duotone p1="M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0" p2="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />,
  
  // Keep some branded icons as-is
  [IconType.Google]: <g><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></g>,
  [IconType.Microsoft]: <g><path d="M2 2h9.5v9.5H2z" fill="#F25022"/><path d="M12.5 2H22v9.5h-9.5z" fill="#7FBA00"/><path d="M2 12.5h9.5V22H2z" fill="#00A4EF"/><path d="M12.5 12.5H22V22h-9.5z" fill="#FFB900"/></g>,
  
  // Stroke-based icons for UI elements
  [IconType.Playground]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" stroke="currentColor" fill="none"/>,
  [IconType.FileCode]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" fill="none" />,
  [IconType.Message]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" fill="none" />,
  [IconType.Sparkles]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" stroke="currentColor" fill="none" />,
  [IconType.Edit]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" fill="none"/>,
  [IconType.Gear]: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" fill="none" /></>,

  // Empty placeholders
  [IconType.LayerLabel]: <></>,
  [IconType.GroupLabel]: <></>,

  // --- Fallback icons will be Generic ---
  [IconType.AwsDynamoDb]: <Duotone p1="M4 11v4l8 4.5 8-4.5v-4L12 15.5 4 11z" p2="M12 2l-8 4.5V10l8 4.5 8-4.5V6.5L12 2z" />,
  [IconType.AwsSns]: <Duotone p1="M7 8H3v8h4l5 5V3L7 8z" p2="M16.5 12a4.5 4.5 0 0 0-4.5-4.5v2a2.5 2.5 0 0 1 0 5v2a4.5 4.5 0 0 0 4.5-4.5z" />,
  [IconType.AwsSqs]: <Duotone p1="M4 11h13v3H4z" p2="M7 6h13v3H7zm0 10h13v3H7z" />,
  [IconType.AwsEventbridge]: <Duotone p1="M4 12h8v2H4z" p2="M20 6h-2V4h2v2zm-4 0h-2V4h2v2zm-4 0H4v2h8V6zm4 8h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H4v2h8v-2zm-4 2h16v2H4v-2z" />,
  [IconType.AwsCloudwatch]: <Duotone p1="M12 7v5.5l4.5 4.5 1-1-4-4V7z" p2="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />,
  [IconType.AzureBlobStorage]: <Duotone p1="M10 4h4v4h-4zm0 6h4v4h-4zm0 6h4v4h-4z" p2="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />,
  [IconType.AzureSqlDatabase]: <Duotone p1="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" p2="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />,
  [IconType.AzureAppService]: <Duotone p1="M7 11h10v11H7z" p2="M12 2L2 11h5v11h10V11h5L12 2z" />,
  [IconType.AzureFunctionApp]: <Duotone p1="M4 4h4v4H4zm12 0h4v4h-4zM4 16h4v4H4zm12 0h4v4h-4z" p2="M10 4h4v4h-4zm0 6h4v4h-4zm-6 0h4v4H4zm12 0h4v4h-4zM10 16h4v4h-4z" />,
  [IconType.AzureServiceBus]: <Duotone p1="M4 11h16v2H4z" p2="M4 4h16v2H4zm0 12h16v2H4z" />,
  [IconType.GcpCloudStorage]: <Duotone p1="M6 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c2.05 0 3.86.95 5.01 2.4A5.5 5.5 0 0 1 17.5 8c2.28 0 4.1 1.66 4.45 3.82A4.5 4.5 0 0 1 17.5 20H6c-3.31 0-6-2.69-6-6z" p2="M17.5 8c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5S20.54 8 17.5 8z" />,
  [IconType.GcpCloudSql]: <Duotone p1="M11 7h2v6h-2zm0 4h2v2h-2z" p2="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />,
  [IconType.GcpBigquery]: <Duotone p1="M11 7h2v8h-2zm0 6h2v2h-2z" p2="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />,
  [IconType.GcpPubsub]: <Duotone p1="M10 6h4v5h-4zm0 7h4v5h-4z" p2="M4 6h5v5H4zm6 0h5v5h-5zm6 0h5v5h-5zM4 13h5v5H4zm6 0h5v5h-5zm6 0h5v5h-5z" />,
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
