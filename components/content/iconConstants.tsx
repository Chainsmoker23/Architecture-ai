import React from 'react';
import { IconType } from '../../types';

export const ICONS: Record<string, React.ReactNode> = {
  // --- Redesigned AWS Icons ---
  [IconType.AwsEc2]: <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z" fill="#FF9900" />,
  [IconType.AwsS3]: <path d="M5 8h14v10H5zM19 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2z" fill="#56B9D0" />,
  [IconType.AwsRds]: <path d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 18c-3.31 0-6-1.34-6-3v-2.62c1.1.81 3.2 1.38 6 1.38s4.9-.57 6-1.38V17c0 1.66-2.69 3-6 3z" fill="#2E73B8" />,
  [IconType.AwsLambda]: <path d="M10 20.44L3.44 13.88 2 15.32l8 8 11.12-11.12L19.7 10.76 10 20.44z" fillRule="evenodd" clipRule="evenodd" fill="#D86613" />,
  [IconType.AwsApiGateway]: <path d="M18 4H6V2H18V4ZM18 22H6V20H18V22ZM21 9H3V7H21V9ZM21 17H3V15H21V17ZM20 13H4V11H20V13Z" fillRule="evenodd" clipRule="evenodd" fill="#4B4B4B" />,
  [IconType.AwsLoadBalancer]: <path d="M3 4h21v2H3V4zm0 7h21v2H3v-2zm0 7h21v2H3v-2z" fillRule="evenodd" clipRule="evenodd" fill="#0073B8" />,
  [IconType.AwsCloudfront]: <path d="M13 13.9a1 1 0 010-1.8h5v-1h-5a1 1 0 010-1.8h6v6.6h-6v-2zm-8.8.1l4-4-4-4L6 4l5 5-5 5-1.8-1.8z" fillRule="evenodd" clipRule="evenodd" fill="#8C4FFF" />,
  [IconType.AwsEcs]: <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" fillRule="evenodd" clipRule="evenodd" fill="#FF9900" />,
  [IconType.AwsDynamoDb]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm0 13.5L4 11v4l8 4.5 8-4.5v-4l-8 4.5z" fill="#2E73B8"/>,
  [IconType.AwsSns]: <path d="M3 8v8h4l5 5V3L7 8H3zm13.5 4a4.5 4.5 0 00-4.5-4.5v2a2.5 2.5 0 010 5v2a4.5 4.5 0 004.5-4.5z" fill="#D86613"/>,
  [IconType.AwsSqs]: <path d="M7 6h13v3H7zm-3 5h13v3H4zm3 5h13v3H7z" fillRule="evenodd" clipRule="evenodd" fill="#D86613"/>,
  [IconType.AwsEventbridge]: <path d="M20 6h-2V4h2v2zm-4 0h-2V4h2v2zm-4 0H4v2h8V6zm4 8h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H4v2h8v-2zm-4 2h16v2H4v-2z" fillRule="evenodd" clipRule="evenodd" fill="#D86613"/>,
  [IconType.AwsCloudwatch]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.29 13.29l-4.58-4.58V5h1.5v5.67l5 5L16.29 15.29z" fill="#2E73B8"/>,
  
  [IconType.AzureVm]: <path fill="#0078D4" d="M5 3h14v18H5V3zm2 2v14h10V5H7zm2 2h6v2H9V7zm0 4h6v2H9v-2zm0 4h3v2H9v-2z"/>,
  [IconType.AzureBlobStorage]: <path fill="#0078D4" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.AzureSqlDatabase]: <path fill="#0078D4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>,
  [IconType.AzureAppService]: <path fill="#0078D4" d="M12 2l-10 9h5v11h10V11h5L12 2zm0 14h-3v-5h3v5z"/>,
  [IconType.AzureFunctionApp]: <path fill="#0078D4" d="M9 2v4H3v2h6V2zm12 0v6h-6V2h6zM9 14v6h6v-6H9zM3 14h6v6H3v-6z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.AzureServiceBus]: <path fill="#0078D4" d="M15 1H9v6h6V1zm2 14h6V9h-6v6zM1 15h6V9H1v6zM1 15h22v2H1z" fillRule="evenodd" clipRule="evenodd"/>,

  [IconType.GcpComputeEngine]: <path fill="#4285F4" d="M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.GcpCloudStorage]: <path fill="#4285F4" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>,
  [IconType.GcpCloudSql]: <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>,
  [IconType.GcpBigquery]: <path fill="#4285F4" d="M12 3a9 9 0 100 18 9 9 0 000-18zm-1 14h2v2h-2v-2zm0-10h2v8h-2V7z"/>,
  [IconType.GcpPubsub]: <path fill="#4285F4" d="M4 11h5V6H4v5zm6-5v5h5V6h-5zm6 0v5h5V6h-5zM4 18h5v-5H4v5zm6 0h5v-5h-5v5zm6 0h5v-5h-5v5z" fillRule="evenodd" clipRule="evenodd"/>,

  [IconType.Kubernetes]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm-1 8.5v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3zM12 16.5l5-2.8v3.3l-5 2.8v-3.3z" fillRule="evenodd" clipRule="evenodd" fill="#326CE5"/>,
  [IconType.Docker]: <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.19 2.58 7.78 6.2 9.25.13.03.26 0 .38-.06.12-.06.22-.16.27-.28.05-.12.05-.25.01-.38a.5.5 0 00-.36-.37c-.12-.05-2.82-.9-2.82-3.23h5.21v-1.5H5.69c0-2.34 2.7-3.18 2.82-3.23a.5.5 0 00.37-.36c.13-.13.12-.3-.02-.42-.13-.13-.3-.12-.42.02-1.03.4-3.17 1.4-3.17 4.98h-1.5c.01-5.05 4.02-9.25 9-9.25s8.99 4.2 9 9.25h-1.5c0-3.58-2.14-4.58-3.17-4.98-.12-.05-.29-.04-.42.02-.14.12-.15.3-.02.42.05.12.15.22.27.28.12.05 2.82.9 2.82 3.23H13v1.5h5.31c0 2.34-2.7 3.18-2.82-3.23a.5.5 0 00-.37.36c-.13-.13-.12.3.02.42.13.13.3.12.42-.02 1.03-.4 3.17-1.4 3.17-4.98h-1.5z" fill="#2496ED" />,
  [IconType.Kafka]: <path d="M10 9.1L6 5v14l4-4.1V9.1z m8 5.8l4 4V5l-4 4.1v5.8z m-2-5.8L12 5v14l4-4.1V9.1z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.MessageQueue]: <path d="M4 9h16v2H4zm0 4h10v2H4z M4 5h16v2H4z M16 13h4v6h-4v-6z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.EventBus]: <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 2h8V3h-8v8zm2-6h4v4h-4V5zm-8 14h8V11h-8v8zm2-6h4v4h-4v-2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.ServiceMesh]: <path d="M12 2l-2 4h4l-2-4z m0 20l-2-4h4l-2 4z M2 12l4 2v-4L2 12z m20 0l-4 2v-4l4 2z M6.5 6.5l-3 3 3 3 3-3-3-3z m11 0l-3 3 3 3 3-3-3-3z m0 11l-3-3 3-3 3 3-3 3z m-11 0l-3-3 3-3 3 3-3 3z" fillRule="evenodd" clipRule="evenodd"/>,
  
  [IconType.Monitoring]: <path d="M16 4H8C6.9 4 6 4.9 6 6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H9V8h6v10z M7 18v-2h10v2H7z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Logging]: <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H4v-2h4v2zm0-4H4v-2h4v2zm8 4h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4H4V7h16v2z" fillRule="evenodd" clipRule="evenodd"/>,
  
  [IconType.BlockchainNode]: <path d="M6 17h12v-2H6v2zm-3-4h18v-2H3v2zm3-4h12V7H6v2zm3-4h6V3H9v2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.SmartContract]: <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2h2v-2zm0 4h-2v2h2v-2zm-4-4H7v2h2v-2z"/>,
  [IconType.Wallet]: <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.34 1-.98 1-1.72V9c0-.74-.41-1.38-1-1.72zM19 19H5V5h14v14zm-8-4H7v-2h4v2z"/>,
  [IconType.Oracle]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>,
  [IconType.Ipfs]: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-12h2v4h-2v-4zm0 6h2v2h-2v-2z"/>,

  [IconType.Javascript]: <g><path d="M2 2h20v20H2z" fill="#F7DF1E" /><path d="M9.82 17.54c.7 0 1.28-.22 1.7-.65s.63-1 .63-1.73c0-.6-.18-1.1-.53-1.5-.35-.4-.8-.6-1.35-.6-.56 0-1.02.2-1.38.6-.36.4-.54.9-.54 1.5 0 .73.2 1.34.6 1.8.4.48.95.73 1.63.73zm6.86-5.12c0 .76-.2 1.4-.6 1.9-.4.5-1 .75-1.75.75-.76 0-1.37-.25-1.84-.75-.47-.5-.7-1.14-.7-1.9 0-.78.23-1.43.7-1.95.47-.52 1.08-.78 1.84-.78.75 0 1.35.26 1.75.78.4.52.6 1.17.6 1.95z" fill="black" /></g>,
  [IconType.Nginx]: <g><circle cx="12" cy="12" r="10" fill="#009639" /><path d="M8.21 6h2.23l3.35 6.78V6h2.1v12h-2.23L10.31 11.2V18H8.21V6z" fill="white" /></g>,
  [IconType.ReactJs]: <g fill="none" stroke="#61DAFB" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></g>,
  [IconType.NodeJs]: <path d="M12 2l9.526 5.5v11L12 24l-9.526-5.5v-11L12 2z M11.13 14.04l-3.34-1.93v-3.84l3.34 1.93v3.84z m1.74 0l3.34-1.93v-3.84l-3.34 1.93v3.84z m-1.74 4.48l-3.34-1.93v-3.84l3.34 1.93v3.84z" fill="#339933" />,
  [IconType.Python]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="#3776AB" /><path d="M12 22a10 10 0 100-20 10 10 0 000 20z M12 17.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#FFD43B" /></g>,
  [IconType.GoLang]: <path d="M12 12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z" fill="#00ADD8" />,
  [IconType.NextJs]: <g><circle cx="12" cy="12" r="10" fill="black" /><path d="M15.68 7.26l-5.64 9.48h-1.59l5.65-9.48H15.68z M9.94 16.74V7.26H8.5v9.48h1.44z" fill="white" /></g>,
  [IconType.ExpressJs]: <g><path d="M17.42 16.03l-1.12.33a.62.62 0 00-.47.8l.34 1.13-1.68.5-1.12-3.75h5.18v-1.5H12.9l1.12-3.75h4.4v-1.5h-5.93l-1.46-4.9h1.68l1.12 3.75h4.06v1.5h-3.7l-1.12 3.75h3.35v1.5H12.2l-1.12 3.75h-1.68l1.13-3.75-3.03-.9.34-1.13a.62.62 0 00-.47-.8l-1.12-.33-1.68.5.83 2.8 1.12.33c.27.08.45.3.52.57l.1.33-1.12 3.75-1.68-.5.34-1.13a.62.62 0 00-.47-.8l-1.12-.33 1.46 4.9h1.68l1.12-3.75h5.5l1.46 4.9h1.68l-.83-2.8-1.12-.33a.62.62 0 00-.7-.27z" fill="#888888" /></g>,
  [IconType.Dotenv]: <g><rect x="3" y="3" width="18" height="18" rx="2" fill="#ECD53C"/><rect x="7" y="7" width="4" height="4" fill="#333" /><rect x="13" y="7" width="4" height="4" fill="#333" /><rect x="7" y="13" width="4" height="4" fill="#333" /><rect x="13" y="13" width="4" height="4" fill="#333" /></g>,
  [IconType.C]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#A8B9CC"/><path d="M15.42 7.37A5.5 5.5 0 0012 6.5a5.5 5.5 0 00-3.42.97l.7.7A4.5 4.5 0 0112 7.5a4.5 4.5 0 013.18 1.32l.74-.75zM8.58 16.63A5.5 5.5 0 0012 17.5a5.5 5.5 0 003.42-.97l-.7-.7A4.5 4.5 0 0112 16.5a4.5 4.5 0 01-3.18-1.32l-.74.75z" fill="#5C6BC0"/></g>,
  [IconType.Cpp]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#A8B9CC"/><path d="M15.42 7.37A5.5 5.5 0 0012 6.5a5.5 5.5 0 00-3.42.97l.7.7A4.5 4.5 0 0112 7.5a4.5 4.5 0 013.18 1.32l.74-.75zM8.58 16.63A5.5 5.5 0 0012 17.5a5.5 5.5 0 003.42-.97l-.7-.7A4.5 4.5 0 0112 16.5a4.5 4.5 0 01-3.18-1.32l-.74.75z" fill="#5C6BC0"/><path d="M17 11h2v2h-2zm3 0h2v2h-2zm-3-3h2v2h-2zm3 0h2v2h-2z" fill="#5C6BC0"/></g>,
  [IconType.Swift]: <g><path d="M22 10.5c0-1-2.4-3.5-4-3.5-1.2 0-2.2.8-3 1.5-1-.8-2-1.5-3-1.5-1.5 0-4 2.5-4 3.5 0 2.2 3 3.7 5 4.5a3 3 0 01-2 2c-3 .8-3 3-3 3h14s0-2.2-3-3a3 3 0 01-2-2c2-.8 5-2.3 5-4.5z" fill="#F05138"/></g>,

  [IconType.ChatGpt]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#75A99C" /><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="white" /></g>,
  [IconType.Gemini]: <path d="M12 2l2.12 7.88L22 12l-7.88 2.12L12 22l-2.12-7.88L2 12l7.88-2.12L12 2z" fill="#8E44AD" />,
  [IconType.Anthropic]: <path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z M12 17a5 5 0 100-10 5 5 0 000 10z" fill="#D36C45" />,
  [IconType.Grok]: <path d="M12 2l-2.8 5.6L2 9.8l4.2 4.2L5.6 21 12 18l6.4 3-1-7 4.2-4.2-7.4-1.4z" fill="#4A90E2" />,
  
  [IconType.Llm]: <path d="M9 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H9z m-2 3H5v2h2v-2z m12 0h-2v2h2v-2z M12 4c-1.1 0-2 .9-2 2v2h4V6c0-1.1-.9-2-2-2z m0 14c1.1 0 2-.9 2-2v-2h-4v2c0 1.1.9 2 2 2z" fill="#6E40C9"/>,
  [IconType.VectorDatabase]: <g fill="#43A047"><path d="M12 3c-4.42 0-8 1.79-8 4v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z"/><path d="M12 5c-3.31 0-6 1.34-6 3v8c0 1.66 2.69 3 6 3s6-1.34 6-3V8c0-1.66-2.69-3-6-3z"/><path d="m8 9 4 2 4-2-4-2-4 2zm0 4 4 2 4-2v-2l-4 2-4-2v2z" fillOpacity="0.5" fill="white"/></g>,
  [IconType.EmbeddingModel]: <g fill="#1E88E5"><path d="M4 4h8v4H4zm2 8h4v2H6zm0 4h4v2H6z M14 4h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6z"/><path d="m11 12-2 2 2 2m3-4 2 2-2 2"/></g>,
  [IconType.PromptManager]: <g fill="#F57C00"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/><path d="M9 16h6v2H9zm2-4h2v2h-2zm-2-2h1.5v-1h-1.5v-1.5h3v1.5h-1.5v1h1.5v1.5h-3z" fillOpacity="0.5" fill="white"/></g>,
  [IconType.DocumentLoader]: <g fill="#757575"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm8 7h5.5L14 3.5V9z"/><path d="m3 9 2-2h1v10H5l-2-2z"/></g>,
  [IconType.KnowledgeBase]: <g fill="#0288D1"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm6 16H9v-2h6v2zm-3-4h-2v-2h2v2zm-2-4V8h4v4h-4z"/></g>,
  [IconType.Gpu]: <g fill="#D84315"><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z"/><path d="M12 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2z"/></g>,
  [IconType.ModelRegistry]: <g fill="#5E35B1"><path d="M20 18H4V6h16M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M7 14h2v-4H7m4 4h2v-2h-2m4 0h2V8h-2"/></g>,
  [IconType.TrainingData]: <g fill="#00838F"><path d="M12 3c-4.42 0-8 1.79-8 4v2c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z"/><path d="M4 12v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/><path d="M4 17v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/></g>,
  [IconType.InferenceApi]: <g fill="#AD1457"><path d="M7 15h2V9H7v6zm4 0h2V9h-2v6zm4-10h-2V3h2v2zm-8-2v2H5V3h2zM7 21h10v-2H7v2z"/><path d="m17.5 13-1-1-1.5 1.5-1.5-1.5-1 1 1.5 1.5-1.5 1.5 1 1 1.5-1.5 1.5 1.5 1-1-1.5-1.5z"/></g>,
  [IconType.DataPreprocessing]: <path d="M3 4h18v4l-7 8v5h-4v-5L3 8V4zm2.17 2L8 12.38V17h8v-4.62L18.83 6H5.17z" fill="#37474F"/>,
  [IconType.Neuron]: <circle cx="12" cy="12" r="12" />,
  [IconType.LayerLabel]: <></>,

  [IconType.Brain]: <path d="M9 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H9z m-2 3H5v2h2v-2z m12 0h-2v2h2v-2z M12 4c-1.1 0-2 .9-2 2v2h4V6c0-1.1-.9-2-2-2z m0 14c1.1 0 2-.9 2-2v-2h-4v2c0 1.1.9 2 2 2z" />,
  [IconType.Planning]: <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2h2v-2zm0 4h-2v2h2v-2zm-4-4H7v2h2v-2z" />,
  [IconType.Perception]: <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-2-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />,
  [IconType.Action]: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  [IconType.Environment]: <path d="M10 20H4v-4H2v6h8z M12 2h6v6h-2V4h-4V2z M12 15.5l-3.5-3.5a5 5 0 117 0L12 15.5z M12 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />,
  [IconType.Memory]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M8 11h8v2H8z" />,
  [IconType.Interaction]: <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />,
  [IconType.WorldKnowledge]: <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm6 16H9v-2h6v2zm-3-4h-2v-2h2v2zm-2-4V8h4v4h-4z" />,
  [IconType.InputEncoder]: <path d="M2 10h4v4H2zm5 0h4v4H7zm5 0h4v4h-4zm5 0h4v4h-4z M4 4h16v4H4z" />,
  [IconType.Simulation]: <path d="M12 3a9 9 0 109 9 9 9 0 00-9-9zm0 16a7 7 0 117-7 7 7 0 01-7 7zm-1-8h2V7h-2zm0 6h2v-4h-2z" />,
  [IconType.Embody]: <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1 7h2v12h-2V9zm-6 2h2v10H5v-10zm12 0h2v10h-2v-10z" />,
  [IconType.GroupLabel]: <></>,

  [IconType.Database]: <path d="M12 3C7.03 3 3 5.36 3 8.25v7.5C3 18.64 7.03 21 12 21s9-2.36 9-5.25v-7.5C21 5.36 16.97 3 12 3zm0 16c-3.87 0-7-1.79-7-4v-1.52c1.22.86 3.89 1.52 7 1.52s5.78-.66 7-1.52V15c0 2.21-3.13 4-7 4zm0-6c-3.87 0-7-1.79-7-4s3.13-4 7-4 7 1.79 7 4-3.13 4-7 4z" />,
  [IconType.Sql]: <g><path d="M4 4h16v16H4z M17 7h-5v10h2V9h3z M10 7H7v4h3v2H7v4h3v2H5V5h5z" fill="#F29111"/></g>,
  [IconType.MySql]: <g><circle cx="12" cy="12" r="10" fill="#E48E00"/><path d="M11 7v3.5l-3-2V7H6v10h2v-4.5l3 2V17h2V7h-2z M17.5 12.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" fill="white"/></g>,
  [IconType.Postgresql]: <path d="M12 6a1 1 0 00-1 1v2H9v2h2v7c0 1.1.9 2 2 2h1a1 1 0 000-2h-1v-7h3v-2h-3V7a1 1 0 00-1-1z M16 4.5c0 .8-.7 1.5-1.5 1.5h-1a1 1 0 100 2h1c.8 0 1.5.7 1.5 1.5v1a1 1 0 102 0v-1C18 6.5 16 4.5 14.5 4.5z M7.5 6C6.7 6 6 6.7 6 7.5v2a1 1 0 102 0v-2C8 6.7 7.3 6 6.5 6z" fill="#336791"/>,
  [IconType.MongoDb]: <path d="M14.2 2.2c-.3-.2-.7-.2-1 0L8.5 5.4c-.3.2-.5.5-.5.9v11.4c0 .4.2.7.5.9l4.8 3.2c.3.2.7.2 1 0l4.8-3.2c.3-.2.5-.5-.5-.9V6.3c0-.4-.2-.7-.5-.9l-4.7-3.2z M11 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#4DB33D" />,
  [IconType.DataStore]: <g><path d="M12 11c-3.87 0-7-1.79-7-4s3.13-4 7-4 7 1.79 7 4-3.13 4-7 4z" /><path d="M5 11v4c0 2.21 3.13 4 7 4s7-1.79 7-4v-4c0 2.21-3.13 4-7 4s-7-1.79-7-4z" /><path d="M5 16v4c0 2.21 3.13 4 7 4s7-1.79 7-4v-4c0 2.21-3.13 4-7 4s-7-1.79-7-4z" fillRule="evenodd" clipRule="evenodd" /></g>,

  [IconType.Firewall]: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />,
  [IconType.AuthService]: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2zm0 4h2v6h-2z" fill="#4CAF50" />,
  [IconType.SecretsManager]: <g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm5 9c0 1.1-.9 2-2 2s-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2z" fill="#FFC107" /></g>,

  [IconType.User]: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
  [IconType.WebServer]: <path d="M20 15v-2h-2V7h2V5h-4V3h-2v2h-4V3H8v2H4v2h2v6H4v2H2v2h2v-2h2v2h12v-2h2v2h2v-2h-2zm-4-2H8V7h8v6z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Api]: <path d="M19.4 6.6a.6.6 0 00-.6-.6h-1.6V4.4c0-.2-.2-.4-.4-.4h-1.6a.4.4 0 00-.4.4v1.6H8.2V4.4c0-.2-.2-.4-.4-.4H6.2a.4.4 0 00-.4.4v1.6H4.2a.6.6 0 00-.6.6v1.6c0 .2.2.4.4.4h1.6v6.8H4.2c-.2 0-.4.2-.4.4v1.6c0 .2.2.4.4.4h1.6v1.6c0 .2.2.4.4.4h1.6c0 .2.2.4.4.4v-1.6h6.8v1.6c0 .2.2.4.4.4h1.6a.4.4 0 00-.4-.4v-1.6h1.6c.2 0 .4-.2.4-.4v-1.6a.6.6 0 00-.4-.4h-1.6V8.6h1.6c.2 0 .4-.2.4-.4V6.6zM14 15.4H9.8V8.6H14v6.8z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Mobile]: <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>,
  [IconType.WebApp]: <path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H5V8h14v10z"/>,
  [IconType.LoadBalancer]: <path d="M20 18H4v-2h16v2zm0-5H4V9h16v4zm0-7H4V4h16v2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Cache]: <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 2h8V3h-8v8zm2-6h4v4h-4V5zM3 21h8v-8H3v8zm2-6h4v4H5v-2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Cloud]: <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>,
  [IconType.ManagementConsole]: <path d="M13 3h-2v18h2zm4.5-2h-2v22h2zm-9 4h-2v14h2zM4 9h-2v6h2z" fillRule="evenodd" clipRule="evenodd"/>,
  [IconType.Microsoft]: <g><path d="M2 2h9.5v9.5H2z" fill="#F25022"/><path d="M12.5 2H22v9.5h-9.5z" fill="#7FBA00"/><path d="M2 12.5h9.5V22H2z" fill="#00A4EF"/><path d="M12.5 12.5H22V22h-9.5z" fill="#FFB900"/></g>,
  [IconType.Google]: <g><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></g>,
  [IconType.Playground]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" stroke="currentColor" fill="none"/>,
  [IconType.FileCode]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" fill="none" />,
  [IconType.Message]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" fill="none" />,
  [IconType.Sparkles]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" stroke="currentColor" fill="none" />,
  [IconType.Edit]: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" fill="none"/>,
  [IconType.Gear]: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" fill="none" /></>,
  [IconType.Generic]: <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" fillRule="evenodd" clipRule="evenodd"/>,

  [IconType.Graph]: <path d="M5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1zM6 6h12v12H6V6zm2 10h2V8H8v8zm4 0h2v-6h-2v6z" />,
};

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

const ChartPlaceholder: React.FC = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="text-[var(--color-text-tertiary)]">
        <rect width="100" height="100" rx="10" fill="var(--color-bg)" />
        <rect x="15" y="75" width="70" height="8" fill="currentColor" opacity="0.5" />
        <rect x="15" y="15" width="8" height="60" fill="currentColor" opacity="0.5" />
        <path d="M 23 75 L 23 60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M 15 60 L 23 60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="23" cy="60" r="3" fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth="1.5" />
    </svg>
);

export const CHART_PREVIEWS = [
    { name: 'Pie Chart', href: '#graph/pie', preview: <svg width="100%" height="100%" viewBox="0 0 100 100"><g transform="translate(50,50)"><path d="M0,0 L40,0 A40,40 0 0,1 -20,34.64 Z" fill="#60A5FA" /><path d="M0,0 L-20,34.64 A40,40 0 0,1 -40,0 Z" fill="#3B82F6" /><path d="M0,0 L-40,0 A40,40 0 0,1 0,-40 Z" fill="#2563EB" /><path d="M0,0 L0,-40 A40,40 0 0,1 40,0 Z" fill="#1D4ED8" /></g></svg> },
    { name: 'Line Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Bar Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Doughnut Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Area Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Scatter Plot', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Bubble Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Radar Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Polar Area Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Candlestick Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Funnel Chart', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Treemap', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Sankey Diagram', href: '#', preview: <ChartPlaceholder /> },
    { name: 'Chord Diagram', href: '#', a: '#', preview: <ChartPlaceholder /> },
    { name: 'Heatmap', href: '#', preview: <ChartPlaceholder /> },
];