
import React from 'react';
import { IconType } from './types';

export const ICONS: Record<string, React.ReactNode> = {
  // --- Redesigned AWS Icons ---
  [IconType.AwsEc2]: <g fill="#FF9900"><path d="M4 4h16v16H4z M6 6h12v12H6z" /><path d="M8 8h8v2H8z M8 12h8v2H8z" /></g>,
  [IconType.AwsS3]: <path d="M12 3C7.03 3 3 5.36 3 8.25v2.25c0 .9 1.12 1.73 2.75 2.25V18c0 1.1.9 2 2 2h8.5c1.1 0 2-.9 2-2V12.75c1.63-.52 2.75-1.35 2.75-2.25V8.25C21 5.36 16.97 3 12 3zm-7 5.25V8.25c0-1.87 2.24-3.5 5-3.5h4c2.76 0 5 1.63 5 3.5v.01c0 .01 0 0 0 0v.01z" fill="#56B9D0" />,
  [IconType.AwsRds]: <g fill="#2E73B8"><path d="M12 3c-4.42 0-8 1.79-8 4v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 16c-3.31 0-6-1.34-6-3V7.62c1.1.81 3.2 1.38 6 1.38s4.9-.57 6-1.38V16c0 1.66-2.69 3-6 3z" /><path d="M12 5c-3.31 0-6 1.34-6 3s2.69 3 6 3 6-1.34 6-3-2.69-3-6-3z" /></g>,
  [IconType.AwsLambda]: <path d="M10.25 4l-7 10h2.5l1.25-2.5h6.5l1.25 2.5h2.5l-7-10zm-.5 1.5L12 10.25 14.25 5.5h-5z" fill="#D86613" />,
  [IconType.AwsApiGateway]: <path d="M18 4h-3V2h-2v2h-2V2H9v2H6V2H4v2h2v2H4v2h2V8h3v2h2V8h2v2h3V8h2V6h-2V4zm-4 12h3v2h-3v2h-2v-2h-2v2H9v-2h3v-2H9v-2h3v2h2v-2h2v2z" />,
  [IconType.AwsLoadBalancer]: <path fillRule="evenodd" d="M12 2a2 2 0 100 4 2 2 0 000-4zM6 8a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zM7 15.5 A1 1 0 0 1 6 16.5 L 6 22 L 4 22 L 4 16.5 A3 3 0 0 1 7 13.5 L 17 13.5 A3 3 0 0 1 20 16.5 L 20 22 L 18 22 L 18 16.5 A1 1 0 0 1 17 15.5 L 7 15.5 M12 6L12 17.5 M6 12L4 12 M20 12L18 12" stroke="currentColor" strokeWidth="1.5" fill="none" />,
  [IconType.AwsCloudfront]: <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.34 0-2.59.33-3.72.91L10 6.65l-1.42 1.42-1.74-1.74A5.99 5.99 0 005.35 8.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM8 12l4-4 4 4h-3v4h-2v-4H8z" fill="#8C4FFF" />,
  [IconType.AwsEcs]: <g fill="#FF9900"><path d="M4 4h16v16H4z M6 6h12v12H6z" /><rect x="8" y="8" width="3" height="3" /><rect x="13" y="8" width="3" height="3" /><rect x="8" y="13" width="3" height="3" /><rect x="13" y="13" width="3" height="3" /></g>,
  [IconType.AwsDynamoDb]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm0 13.5L4 11v4l8 4.5 8-4.5v-4l-8 4.5z" fill="#2E73B8"/>,
  [IconType.AwsSns]: <g stroke="none" fill="#D86613"><path d="M16 2H8C6.9 2 6 2.9 6 4v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 4h8v12H8V4zm4 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M14 10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/></g>,
  [IconType.AwsSqs]: <g fill="#D86613"><path d="M4 4h16v16H4z M6 6h12v12H6z"/><path d="M8 8h8v2H8z M8 11h8v2H8z M8 14h5v2H8z"/></g>,
  [IconType.AwsEventbridge]: <path d="M2 14h6v2H2z M2 8h6v2H2z M16 14h6v2h-6z M16 8h6v2h-6z M9 2h6v2H9z M9 18h6v2H9z M9 5h6v12H9z" fill="#D86613"/>,
  [IconType.AwsCloudwatch]: <g fill="#2E73B8"><circle cx="12" cy="12" r="8" /><path d="M12 7v5h4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" /><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" /></g>,
  
  [IconType.AzureVm]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10v8H7z M9 10h6v1H9z M9 13h4v1H9z" fill="white"/></g>,
  [IconType.AzureBlobStorage]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="2" fill="white"/><circle cx="15" cy="9" r="3" fill="white"/><circle cx="9" cy="16" r="2.5" fill="white"/></g>,
  [IconType.AzureSqlDatabase]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 7c-2.76 0-5 1.12-5 2.5s2.24 2.5 5 2.5 5-1.12 5-2.5S14.76 7 12 7zm0 9c-2.76 0-5-1.12-5-2.5v1c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5v-1c0 1.38-2.24 2.5-5 2.5z" fill="white"/></g>,
  [IconType.AzureAppService]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 6l-6 5h3v7h6v-7h3l-6-5zm-1 7v-3h2v3h-2z" fill="white"/></g>,
  [IconType.AzureFunctionApp]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M13 5h-2v4H7l5 6v-4h2l-5-6z" fill="white"/></g>,
  [IconType.AzureServiceBus]: <g fill="#0078D4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10v2H7z M7 11h10v2H7z M7 15h10v2H7z" stroke="white" strokeWidth="1" fill="none"/></g>,

  [IconType.GcpComputeEngine]: <g fill="#4285F4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10v2H7z M7 11h10v2H7z M7 15h10v2H7z" fill="white"/></g>,
  [IconType.GcpCloudStorage]: <g fill="#4285F4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M17.35 12.04C16.67 8.59 13.64 6 10 6c-2.89 0-5.4 1.64-6.65 4.04C.34 10.36-2 12.91-2 16c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" transform="scale(0.7) translate(5,2)" fill="white"/></g>,
  [IconType.GcpCloudSql]: <g fill="#4285F4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 7c-2.76 0-5 1.12-5 2.5s2.24 2.5 5 2.5 5-1.12 5-2.5S14.76 7 12 7zm0 9c-2.76 0-5-1.12-5-2.5v1c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5v-1c0 1.38-2.24 2.5-5 2.5z" fill="white"/></g>,
  [IconType.GcpBigquery]: <g fill="#4285F4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm-1 6h2v2h-2v-2zm0-5h2v4h-2V8z" fill="white" /></g>,
  [IconType.GcpPubsub]: <g fill="#4285F4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 11h4v4H7zm6-4h4v4h-4z M7 7h4v4H7zm6 4h4v4h-4z" stroke="white" strokeWidth="1" fill="none"/></g>,

  [IconType.Kubernetes]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm-1 8.5v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3zM12 16.5l5-2.8v3.3l-5 2.8v-3.3z" fill="#326CE5"/>,
  [IconType.Docker]: <path d="M22.2,11.5c-0.4-1-1-1.9-1.8-2.7c-0.8-0.8-1.8-1.4-2.8-1.8C16.6,6.6,15.5,6.4,14.4,6.4H4.8C4.7,6.4,4.6,6.4,4.5,6.4c-0.2,0-0.4,0-0.6-0.1c-0.2,0-0.4,0.1-0.6,0.1c-0.2,0-0.4,0-0.6-0.1C2,6.7,1.4,7.1,0.9,7.6c-0.5,0.5-0.9,1.1-1.1,1.8C-0.5,10.2-0.6,11-0.5,12c0.1,0.9,0.3,1.8,0.7,2.6h16.2c0,0-0.1-0.1-0.1-0.1c-0.3-0.5-0.5-1-0.5-1.6c0-0.6,0.2-1.2,0.5-1.6c0.3-0.5,0.8-0.8,1.3-1.1c0.6-0.2,1.2-0.3,1.8-0.2c0.2,0,0.5,0,0.7,0.1c0.2,0.1,0.4,0.2,0.6,0.3c0.2,0.1,0.4,0.3,0.5,0.5c0.1,0.2,0.2,0.4,0.3,0.6c0,0.1,0.1,0.2,0.1,0.3c0.1,0.3,0.1,0.6,0.1,0.9c0,0.3,0,0.6-0.1,0.9c0,0.1,0,0.2-0.1,0.3c-0.1,0.2-0.2,0.4-0.3,0.6c-0.1,0.2-0.3,0.4-0.5,0.5c-0.2,0.1-0.4,0.2-0.6,0.3c-0.2,0-0.5,0.1-0.7,0.1c-0.6,0-1.2-0.1-1.8-0.2c-0.6-0.2-1.1-0.6-1.3-1.1c-0.3-0.5-0.5-1-0.5-1.6c0-0.6,0.2-1.2,0.5-1.6h-5v3.1h3.1v3.1h-3.1v3.1H9.4v3.1h3.1V24H6.2v-3.1h3.1v-3.1H6.2v-3.1h3.1v-3.1H3.1c-0.1-0.4-0.1-0.7-0.1-1.1c0-0.4,0-0.7,0.1-1.1h10.4c0,0.6-0.2,1.2-0.5,1.6c-0.3,0.5-0.8,0.8-1.3,1.1c-0.6,0.2-1.2,0.3-1.8,0.2c-0.2,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.6-0.3c-0.2-0.1-0.4-0.3-0.5-0.5c-0.1-0.2-0.2-0.4-0.3-0.6c0-0.1-0.1-0.2-0.1-0.3c-0.1-0.3-0.1-0.6-0.1-0.9c0-0.3,0-0.6,0.1-0.9c0-0.1,0-0.2,0.1-0.3c0.1-0.2,0.2-0.4,0.3-0.6c0.1-0.2,0.3-0.4,0.5-0.5c0.2-0.1,0.4-0.2,0.6-0.3c0.2,0,0.5-0.1,0.7-0.1c0.6,0,1.2,0.1,1.8,0.2c0.6,0.2,1.1,0.6,1.3,1.1c0.3,0.5,0.5,1,0.5,1.6c0,0.6-0.2,1.2-0.5,1.6c0,0,0.1,0,0.1,0.1c0.4,0.4,0.8,0.8,1.3,1.1c0.5,0.3,1,0.5,1.6,0.7c0.6,0.2,1.2,0.2,1.8,0.2c0.6,0,1.3-0.1,1.8-0.3c0.6-0.2,1.1-0.5,1.6-0.9c0.5-0.4,0.9-0.9,1.2-1.4c0.3-0.6,0.5-1.2,0.6-1.8C22.4,12.7,22.4,12.1,22.2,11.5zM6.2,6.4H3.1c-0.1-0.4-0.1-0.7-0.1-1.1c0-0.4,0-0.7,0.1-1.1h3.1V6.4z M9.4,3.3V0.2h3.1V3.3H9.4z" transform="scale(0.8) translate(2,0)" fill="#2496ED" />,
  
  [IconType.Kafka]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4m0 12v4M12 2v8m0 8v4M16 2v12m0 4v4M4 8h4m8 0h4M4 16h4m8 0h4" /></g>,
  [IconType.MessageQueue]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12h4m-8 0h.01M12 12h.01M8 12h.01M10 16h4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></g>,
  [IconType.EventBus]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h10M6 12h10M8 18h7"/><path d="M3 6h1m-1 6h1m-1 6h1m16-6h1M4 4v16"/><path d="M20 4v16"/></g>,
  [IconType.ServiceMesh]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M13.5 10.5l3-3M13.5 13.5l3 3M10.5 13.5l-3 3M10.5 10.5l-3-3M18 9v6M6 9v6"/></g>,
  
  [IconType.Monitoring]: <path d="M3 3v18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 12l5-5 4 4 3-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Logging]: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M9 15h6M9 11h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  
  [IconType.BlockchainNode]: <path d="M4 7V4h3m10 0h3v3M4 17v3h3m10 0h3v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="7" y="7" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.SmartContract]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><circle cx="12" cy="15" r="2"/><path d="M12 11v2m0 4v2m-4-4H6m4 4H6m12-4h-2m-4-4h2"/></g>,
  [IconType.Wallet]: <path d="M20 12V8H6a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 012 2v4h-2m-2 4a2 2 0 002-2V6m-4 6v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Oracle]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M20.94 12c-.46-4.17-3.77-7.48-7.94-7.94m-1.95 15.88c4.17-.46 7.48-3.77 7.94-7.94"/><path d="M3.06 12c.46 4.17 3.77 7.48 7.94 7.94m1.95-15.88C8.83 4.52 5.52 7.83 5.06 12"/></g>,
  [IconType.Ipfs]: <g fill="#65C2CB"><path d="M12 2l10 6v1.5L12 16l-10-6.5V8l10-6z"/><path d="M2 10.5l10 6.5 10-6.5L12 4l-10 6.5z"/><path d="M2 17l10 6.5 10-6.5-10-6.5-10 6.5z"/></g>,

  [IconType.Javascript]: <g fill="#F7DF1E"><path d="M2 2h20v20H2z" /><path d="M9.82 17.54c.7 0 1.28-.22 1.7-.65s.63-1 .63-1.73c0-.6-.18-1.1-.53-1.5-.35-.4-.8-.6-1.35-.6-.56 0-1.02.2-1.38.6-.36.4-.54.9-.54 1.5 0 .73.2 1.34.6 1.8.4.48.95.73 1.63.73zm6.86-5.12c0 .76-.2 1.4-.6 1.9-.4.5-1 .75-1.75.75-.76 0-1.37-.25-1.84-.75-.47-.5-.7-1.14-.7-1.9 0-.78.23-1.43.7-1.95.47-.52 1.08-.78 1.84-.78.75 0 1.35.26 1.75.78.4.52.6 1.17.6 1.95z" fill="black" /></g>,
  [IconType.Nginx]: <g><circle cx="12" cy="12" r="10" fill="#009639" /><path d="M8.21 6h2.23l3.35 6.78V6h2.1v12h-2.23L10.31 11.2V18H8.21V6z" fill="white" /></g>,
  [IconType.ReactJs]: <g fill="none" stroke="#61DAFB" strokeWidth="1.5"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/></g>,
  [IconType.NodeJs]: <path d="M12 2l9.526 5.5v11L12 24l-9.526-5.5v-11L12 2z M11.13 14.04l-3.34-1.93v-3.84l3.34 1.93v3.84z m1.74 0l3.34-1.93v-3.84l-3.34 1.93v3.84z m-1.74 4.48l-3.34-1.93v-3.84l3.34 1.93v3.84z" fill="#339933" />,
  [IconType.Python]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="#3776AB" /><path d="M12 22a10 10 0 100-20 10 10 0 000 20z M12 17.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#FFD43B" /></g>,
  [IconType.GoLang]: <path d="M12 12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z" fill="#00ADD8" />,
  [IconType.NextJs]: <g><circle cx="12" cy="12" r="10" fill="black" /><path d="M15.68 7.26l-5.64 9.48h-1.59l5.65-9.48H15.68z M9.94 16.74V7.26H8.5v9.48h1.44z" fill="white" /></g>,
  [IconType.ExpressJs]: <g><path d="M17.42 16.03l-1.12.33a.62.62 0 00-.47.8l.34 1.13-1.68.5-1.12-3.75h5.18v-1.5H12.9l1.12-3.75h4.4v-1.5h-5.93l-1.46-4.9h1.68l1.12 3.75h4.06v1.5h-3.7l-1.12 3.75h3.35v1.5H12.2l-1.12 3.75h-1.68l1.13-3.75-3.03-.9.34-1.13a.62.62 0 00-.47-.8l-1.12-.33-1.68.5.83 2.8 1.12.33c.27.08.45.3.52.57l.1.33-1.12 3.75-1.68-.5.34-1.13a.62.62 0 00-.47-.8l-1.12-.33 1.46 4.9h1.68l1.12-3.75h5.5l1.46 4.9h1.68l-.83-2.8-1.12-.33a.62.62 0 00-.7-.27z" fill="#888888" /></g>,
  [IconType.Dotenv]: <g><rect x="3" y="3" width="18" height="18" rx="2" fill="#ECD53C"/><rect x="7" y="7" width="4" height="4" fill="#333" /><rect x="13" y="7" width="4" height="4" fill="#333" /><rect x="7" y="13" width="4" height="4" fill="#333" /><rect x="13" y="13" width="4" height="4" fill="#333" /></g>,
  [IconType.C]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#A8B9CC"/><path d="M15.42 7.37A5.5 5.5 0 0012 6.5a5.5 5.5 0 00-3.42.97l.7.7A4.5 4.5 0 0112 7.5a4.5 4.5 0 013.18 1.32l.74-.75zM8.58 16.63A5.5 5.5 0 0012 17.5a5.5 5.5 0 003.42-.97l-.7-.7A4.5 4.5 0 0112 16.5a4.5 4.5 0 01-3.18-1.32l-.74.75z" fill="#5C6BC0"/></g>,
  [IconType.Cpp]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#A8B9CC"/><path d="M15.42 7.37A5.5 5.5 0 0012 6.5a5.5 5.5 0 00-3.42.97l.7.7A4.5 4.5 0 0112 7.5a4.5 4.5 0 013.18 1.32l.74-.75zM8.58 16.63A5.5 5.5 0 0012 17.5a5.5 5.5 0 003.42-.97l-.7-.7A4.5 4.5 0 0112 16.5a4.5 4.5 0 01-3.18-1.32l-.74.75z" fill="#5C6BC0"/><path d="M17 11h2v2h-2zm3 0h2v2h-2zm-3-3h2v2h-2zm3 0h2v2h-2z" fill="#5C6BC0"/></g>,
  [IconType.Swift]: <path d="M22 10.5c0-1-2.4-3.5-4-3.5-1.2 0-2.2.8-3 1.5-1-.8-2-1.5-3-1.5-1.5 0-4 2.5-4 3.5 0 2.2 3 3.7 5 4.5a3 3 0 01-2 2c-3 .8-3 3-3 3h14s0-2.2-3-3a3 3 0 01-2-2c2-.8 5-2.3 5-4.5z" fill="#F05138"/>,

  [IconType.ChatGpt]: <path d="M16.92.48C13.84-.7 10.16-.7 7.08.48c-3.08 1.18-5.4 3.5-6.6 6.6C-.7 10.16-.7 13.84.48 16.92c1.18 3.08 3.5 5.4 6.6 6.6 3.08 1.18 6.76 1.18 9.84 0 3.08-1.18 5.4-3.5 6.6-6.6 1.18-3.08 1.18-6.76 0-9.84-1.2-3.12-3.52-5.42-6.6-6.6z M12 21.6c-2.64 0-5.1-1-6.96-2.82V18l1.44 1.08c1.62 1.2 3.66 1.92 5.52 1.92s3.9-.72 5.52-1.92L18.96 18v.78c-1.86 1.8-4.32 2.82-6.96 2.82zM4.32 15.6c-.66-1.56-1.02-3.24-1.08-4.92.06-1.68.42-3.36 1.08-4.92L5.4 4.68l1.08 1.44c-1.2 1.62-1.92 3.66-1.92 5.52 0 1.86.72 3.9 1.92 5.52l-1.08 1.44-1.08-1.2z m15.36 0l-1.08 1.2-1.08-1.44c1.2-1.62 1.92-3.66 1.92-5.52s-.72-3.9-1.92-5.52l1.08-1.44 1.08 1.2c.66 1.56 1.02 3.24 1.08 4.92-.06 1.68-.42 3.36-1.08 4.92z M12 4.08c-1.86 0-3.9.72-5.52 1.92L5.4 7.08 4.32 5.28C6.18 3.48 8.64 2.4 12 2.4s5.82 1.08 7.68 2.88l-1.08 1.8-1.08-1.08C15.9 4.8 13.86 4.08 12 4.08z" transform="scale(0.9) translate(1,1)" fill="#75A99C"/>,
  [IconType.Gemini]: <path d="M12 2l2.12 7.88L22 12l-7.88 2.12L12 22l-2.12-7.88L2 12l7.88-2.12L12 2z" fill="#8E44AD" />,
  [IconType.Anthropic]: <path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z M12 17a5 5 0 100-10 5 5 0 000 10z" fill="#D36C45" />,
  [IconType.Grok]: <path d="M12 2l-2.8 5.6L2 9.8l4.2 4.2L5.6 21 12 18l6.4 3-1-7 4.2-4.2-7.4-1.4z" fill="#4A90E2" />,
  
  [IconType.Llm]: <path d="M12 2a10 10 0 00-4.33 1.23 4 4 0 010 17.54A10 10 0 1012 2zM9 12a3 3 0 110-6 3 3 0 010 6z" />,
  [IconType.VectorDatabase]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-4.42 0-8 1.79-8 4v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z"/><path d="M4 7v3c0 2.21 3.58 4 8 4s8-1.79 8-4V7"/><path d="M4 12v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3"/></g>,
  [IconType.EmbeddingModel]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9.5l-2 5l2 5M14 9.5l2 5-2 5M17 21l3-3l-3-3M7 3l-3 3l3 3"/></g>,
  [IconType.PromptManager]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 14h6m-3 3l1 1l1-1m-1-5v6"/></g>,
  [IconType.DocumentLoader]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6m-3 3l3 3l3-3"/></g>,
  [IconType.KnowledgeBase]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20v-11H6.5A2.5 2.5 0 014 3.5v16zM20 17H6.5"/><path d="M8 7h6m-6 4h6"/></g>,
  [IconType.Gpu]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9zM9 1v3m6 16v3m7-15h-3m-1 15h-3m-13-1l3-3m11 11l3-3M2 13l3 3m14-14l-3 3"/></g>,
  [IconType.ModelRegistry]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><path d="M12 21V3"/></g>,
  [IconType.TrainingData]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-4.42 0-8 1.79-8 4v2c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z"/><path d="M4 12v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/><path d="M4 17v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/></g>,
  [IconType.InferenceApi]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 15h2V9H7v6zm4 0h2V9h-2v6zm4-10h-2V3h2v2zm-8-2v2H5V3h2zM7 21h10v-2H7v2z"/><path d="M17.5 13l-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5"/></g>,
  [IconType.DataPreprocessing]: <path d="M3 3h18v4l-7 8v5h-4v-5L3 7V3zm2.17 2L8 12.38V17h8v-4.62L18.83 6H5.17z" />,
  [IconType.Neuron]: <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />,
  [IconType.LayerLabel]: <></>,

  [IconType.Brain]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 00-4 4v1.5a2.5 2.5 0 01-5 0V6a4 4 0 00-4-4m17 0a4 4 0 00-4 4v1.5a2.5 2.5 0 01-5 0V6a4 4 0 00-4-4"/><path d="M2 13.5V14a4 4 0 004 4h.5a2.5 2.5 0 015 0H12a4 4 0 004-4v-.5m5 0V14a4 4 0 004 4h.5a2.5 2.5 0 015 0H22a4 4 0 004-4v-.5"/><path d="M6 18v2m12-2v2M12 18v4"/></g>,
  [IconType.Planning]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></g>,
  [IconType.Perception]: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Action]: <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Environment]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></g>,
  [IconType.Memory]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></g>,
  [IconType.Interaction]: <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />,
  [IconType.WorldKnowledge]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></g>,
  [IconType.InputEncoder]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h3m14 0h3m-7-5v10m5-10v10"/><rect x="7" y="4" width="10" height="16" rx="2"/></g>,
  [IconType.Simulation]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0119-4.8V2M22 12.5a10 10 0 01-19 4.8V22"/></g>,
  [IconType.Embody]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><path d="M12 8v8m-3 0h6m-6-4h6m-3 8v4" /><path d="M9 16l-2 6m10-6l2 6" /></g>,
  [IconType.GroupLabel]: <></>,

  [IconType.Database]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></g>,
  [IconType.Sql]: <g><path d="M4 4h16v16H4z M17 7h-5v10h2V9h3z M10 7H7v4h3v2H7v4h3v2H5V5h5z" fill="#F29111"/></g>,
  [IconType.MySql]: <g><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#E48E00"/><path d="M11 7v3.5l-3-2V7H6v10h2v-4.5l3 2V17h2V7h-2z M17.5 12.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" fill="white"/></g>,
  [IconType.Postgresql]: <path d="M12 6a1 1 0 00-1 1v2H9v2h2v7c0 1.1.9 2 2 2h1a1 1 0 000-2h-1v-7h3v-2h-3V7a1 1 0 00-1-1z M16 4.5c0 .8-.7 1.5-1.5 1.5h-1a1 1 0 100 2h1c.8 0 1.5.7 1.5 1.5v1a1 1 0 102 0v-1C18 6.5 16 4.5 14.5 4.5z M7.5 6C6.7 6 6 6.7 6 7.5v2a1 1 0 102 0v-2C8 6.7 7.3 6 6.5 6z" fill="#336791"/>,
  [IconType.MongoDb]: <path d="M14.2 2.2c-.3-.2-.7-.2-1 0L8.5 5.4c-.3.2-.5.5-.5.9v11.4c0 .4.2.7.5.9l4.8 3.2c.3.2.7.2 1 0l4.8-3.2c.3-.2.5-.5-.5-.9V6.3c0-.4-.2-.7-.5-.9l-4.7-3.2z M11 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#4DB33D" />,
  [IconType.DataStore]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-4.42 0-8 1.79-8 4v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4z"/><path d="M4 7v3c0 2.21 3.58 4 8 4s8-1.79 8-4V7"/><path d="M4 12v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3"/></g>,

  [IconType.Firewall]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V10m0-8V2M4 10h16M4 16h16M12 10V2m0 8h8m-8 0H4m8 6h8m-8 0H4m8 6v-6m-4 0v-6m8 6v-6"/></g>,
  [IconType.AuthService]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></g>,
  [IconType.SecretsManager]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778-7.778 5.5 5.5 0 017.777 7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></g>,

  [IconType.User]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></g>,
  [IconType.WebServer]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><path d="M6 6h.01M6 18h.01"/></g>,
  [IconType.Api]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20.592L4.08 17.5l-.92-5.4L6.08 9l.92-5.4L12 2l5.08 3 5.92 3.5-2.08 12.088L12 22l-2-1.408"/><path d="M12 2v20"/><path d="M4.08 17.5L12 22l7.92-4.5"/><path d="M4.08 6.5L12 2l7.92 4.5"/><path d="M12 12l7.92-4.5M12 12L4.08 17.5M12 12l7.92 4.5M12 12L4.08 6.5"/></g>,
  [IconType.Mobile]: <rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.WebApp]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01"/></g>,
  [IconType.LoadBalancer]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 18H4M4 6h16"/><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" d="M12 12l-7-6" cy="18" r="2"/><circle cx="19" cy="18" r="2"/></g>,
  [IconType.Cache]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M13 10V3L4 14h7v7l9-11h-7z"/></g>,
  [IconType.Cloud]: <path d="M18 10h-1.26A8 8 0 104 16h13a5 5 0 000-10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.ManagementConsole]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6"/><path d="M12 19h8"/></g>,
  [IconType.Microsoft]: <g><path d="M2 2h9.5v9.5H2z" fill="#F25022"/><path d="M12.5 2H22v9.5h-9.5z" fill="#7FBA00"/><path d="M2 12.5h9.5V22H2z" fill="#00A4EF"/><path d="M12.5 12.5H22V22h-9.5z" fill="#FFB900"/></g>,
  [IconType.Google]: <g><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></g>,
  [IconType.Playground]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L6 8l6 6l6-6l-6-6z"/><path d="M6 8l6 6l6-6"/><path d="M6 16l6 6l6-6"/></g>,
  [IconType.FileCode]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M10 16l-2-2 2-2m4 0l2 2-2 2"/></g>,
  [IconType.Message]: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Sparkles]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></g>,
  [IconType.Edit]: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  [IconType.Gear]: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></g>,
  [IconType.Generic]: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
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
