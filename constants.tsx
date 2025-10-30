import React from 'react';
import { IconType } from './types';

export const ICONS: Record<string, React.ReactNode> = {
  [IconType.AwsEc2]: <path d="M4 2h16v3H4zm0 17h16v3H4zm3-6.41V9.41l-3 1.74v3.69zm10 0V9.41l-3 1.74v3.69zM8.5 8.27L12 6.29l3.5 1.98v4.04L12 14.29l-3.5-1.98z" fill="#FF9900" />,
  [IconType.AwsS3]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v8h-2z" fill="#56B9D0" />,
  [IconType.AwsRds]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#2E73B8" />,
  [IconType.AwsLambda]: <path d="M11 2h2v5h-2zm-6.5 6.5L6.21 10l-1.71 1.71L2.79 10zm13 0L17.79 10l1.71 1.71L21.21 10zM12 11c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" fill="#D86613" />,
  [IconType.AwsApiGateway]: <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V8h4v2z" fill="#4B4B4B" />,
  [IconType.AwsLoadBalancer]: <path d="M20 18H4v-2h16v2zm0-5H4V9h16v4zm0-7H4V4h16v2z" fill="#0073B8" />,
  [IconType.AwsCloudfront]: <path d="M13 13.9a1 1 0 010-1.8h5v-1h-5a1 1 0 010-1.8h6v6.6h-6v-2zm-8.8.1l4-4-4-4L6 4l5 5-5 5-1.8-1.8z" fill="#8C4FFF" />,
  [IconType.AwsEcs]: <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" fill="#FF9900" />,
  [IconType.AwsDynamoDb]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm0 13.5L4 11v4l8 4.5 8-4.5v-4l-8 4.5z" fill="#2E73B8"/>,
  [IconType.AwsSns]: <path d="M3 8v8h4l5 5V3L7 8H3zm13.5 4a4.5 4.5 0 00-4.5-4.5v2a2.5 2.5 0 010 5v2a4.5 4.5 0 004.5-4.5z" fill="#D86613"/>,
  [IconType.AwsSqs]: <path d="M7 6h13v3H7zm-3 5h13v3H4zm3 5h13v3H7z" fill="#D86613"/>,
  [IconType.AwsEventbridge]: <path d="M20 6h-2V4h2v2zm-4 0h-2V4h2v2zm-4 0H4v2h8V6zm4 8h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H4v2h8v-2zm-4 2h16v2H4v-2z" fill="#D86613"/>,
  [IconType.AwsCloudwatch]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.29 13.29l-4.58-4.58V5h1.5v5.67l5 5L16.29 15.29z" fill="#2E73B8"/>,
  
  [IconType.AzureVm]: <path fill="#0078D4" d="M5 3h14v18H5z M7 5h10v14H7z M9 7h6v2H9z M9 11h6v2H9z M9 15h6v2H9z"/>,
  [IconType.AzureBlobStorage]: <path fill="#0078D4" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>,
  [IconType.AzureSqlDatabase]: <path fill="#0078D4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>,
  [IconType.AzureAppService]: <path fill="#0078D4" d="M12 2l-10 9h5v11h10V11h5L12 2zm0 14h-3v-5h3v5z"/>,
  [IconType.AzureFunctionApp]: <path fill="#0078D4" d="M9 2v4H3v2h6V2zm12 0v6h-6V2h6zM9 14v6h6v-6H9zM3 14h6v6H3v-6z"/>,
  [IconType.AzureServiceBus]: <path fill="#0078D4" d="M15 1H9v6h6V1zm2 14h6V9h-6v6zm-18 0h6V9H-1v6zM1 15h22v2H-1z"/>,

  [IconType.GcpComputeEngine]: <path fill="#4285F4" d="M4 4h16v2H4z M4 9h16v2H4z M4 14h16v2H4z M4 19h16v2H4z"/>,
  [IconType.GcpCloudStorage]: <path fill="#4285F4" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>,
  [IconType.GcpCloudSql]: <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>,
  [IconType.GcpBigquery]: <path fill="#4285F4" d="M12 3a9 9 0 100 18 9 9 0 000-18zm-1 14h2v2h-2v-2zm0-10h2v8h-2V7z"/>,
  [IconType.GcpPubsub]: <path fill="#4285F4" d="M4 11h5V6H4v5zm6-5v5h5V6h-5zm6 0v5h5V6h-5zM4 18h5v-5H4v5zm6 0h5v-5h-5v5zm6 0h5v-5h-5v5z"/>,

  [IconType.Kubernetes]: <path d="M12 2l8 4.5V10l-8 4.5L4 10V6.5L12 2zm-1 8.5v3.3l-5-2.8v-3.3l5 2.8z m2 0l5-2.8v3.3l-5 2.8v-3.3zM12 16.5l5-2.8v3.3l-5 2.8v-3.3z" fill="#326CE5"/>,
  [IconType.Docker]: <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.19 2.58 7.78 6.2 9.25.13.03.26 0 .38-.06.12-.06.22-.16.27-.28.05-.12.05-.25.01-.38a.5.5 0 00-.36-.37c-.12-.05-2.82-.9-2.82-3.23h5.21v-1.5H5.69c0-2.34 2.7-3.18 2.82-3.23a.5.5 0 00.37-.36c.13-.13.12-.3-.02-.42-.13-.13-.3-.12-.42.02-1.03.4-3.17 1.4-3.17 4.98h-1.5c.01-5.05 4.02-9.25 9-9.25s8.99 4.2 9 9.25h-1.5c0-3.58-2.14-4.58-3.17-4.98-.12-.05-.29-.04-.42.02-.14.12-.15.3-.02.42.05.12.15.22.27.28.12.05 2.82.9 2.82 3.23H13v1.5h5.31c0 2.34-2.7 3.18-2.82 3.23a.5.5 0 00-.37.36c-.13.13-.12.3.02.42.13.13.3.12.42-.02 1.03-.4 3.17-1.4 3.17-4.98h-1.5z" fill="#2496ED" />,
  [IconType.Kafka]: <path d="M10 9.1L6 5v14l4-4.1V9.1z m8 5.8l4 4V5l-4 4.1v5.8z m-2-5.8L12 5v14l4-4.1V9.1z" />,
  [IconType.MessageQueue]: <path d="M4 9h16v2H4zm0 4h10v2H4z M4 5h16v2H4z M16 13h4v6h-4v-6z" />,
  [IconType.EventBus]: <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 2h8V3h-8v8zm2-6h4v4h-4V5zm-8 14h8V11h-8v8zm2-6h4v4h-4v-2z" />,
  [IconType.ServiceMesh]: <path d="M12 2l-2 4h4l-2-4z m0 20l-2-4h4l-2 4z M2 12l4 2v-4L2 12z m20 0l-4 2v-4l4 2z M6.5 6.5l-3 3 3 3 3-3-3-3z m11 0l-3 3 3 3 3-3-3-3z m0 11l-3-3 3-3 3 3-3 3z m-11 0l-3-3 3-3 3 3-3 3z" />,
  
  [IconType.Monitoring]: <path d="M16 4H8C6.9 4 6 4.9 6 6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H9V8h6v10z M7 18v-2h10v2H7z" />,
  [IconType.Logging]: <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H4v-2h4v2zm0-4H4v-2h4v2zm8 4h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4H4V7h16v2z" />,
  
  [IconType.BlockchainNode]: <path d="M6 17h12v-2H6v2zm-3-4h18v-2H3v2zm3-4h12V7H6v2zm3-4h6V3H9v2z" />,
  [IconType.SmartContract]: <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2h2v-2zm0 4h-2v2h2v-2zm-4-4H7v2h2v-2z" />,
  [IconType.Wallet]: <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.34 1-.98 1-1.72V9c0-.74-.41-1.38-1-1.72zM19 19H5V5h14v14zm-8-4H7v-2h4v2z" />,
  [IconType.Oracle]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />,
  [IconType.Ipfs]: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-12h2v4h-2v-4zm0 6h2v2h-2v-2z" />,

  [IconType.User]: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
  [IconType.Database]: <path d="M12 3C7.03 3 3 5.36 3 8.25V15.75C3 18.64 7.03 21 12 21s9-2.36 9-5.25V8.25C21 5.36 16.97 3 12 3zm0 2c3.48 0 6.3 1.57 6.82 3.5H5.18C5.7 6.57 8.52 5 12 5zm0 14c-4.97 0-9-2.36-9-5.25v-1.5c0 .3.02.6.05.89C3.62 15.64 7.35 18 12 18s8.38-2.36 8.95-4.86c.03-.29.05-.59.05-.89v1.5C21 16.64 16.97 19 12 19z" />,
  [IconType.WebServer]: <path d="M20 15v-2h-2V7h2V5h-4V3h-2v2h-4V3H8v2H4v2h2v6H4v2H2v2h2v-2h2v2h12v-2h2v2h2v-2h-2zm-4-2H8V7h8v6z" />,
  [IconType.Api]: <path d="M7 15h2V9H7v6zm4 0h2V9h-2v6zm4-10h-2V3h2v2zm-8-2v2H5V3h2zM7 21h10v-2H7v2z" />,
  [IconType.Mobile]: <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />,
  [IconType.WebApp]: <path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H5V8h14v10z" />,
  [IconType.LoadBalancer]: <path d="M20 18H4v-2h16v2zm0-5H4V9h16v4zm0-7H4V4h16v2z" />,
  [IconType.Firewall]: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />,
  [IconType.Cache]: <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 2h8V3h-8v8zm2-6h4v4h-4V5zM3 21h8v-8H3v8zm2-6h4v4H5v-2z" />,
  [IconType.Generic]: <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" />,
};

export const EXAMPLE_PROMPT = "Design an AWS-based architecture for a scalable fintech application using ECS Fargate, RDS Postgres, S3 for storage, and CloudFront for CDN. Include a user accessing the service from a web app.";

export const FOOTER_LINKS = {
  socials: [
    { name: 'GitHub', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
    { name: 'LinkedIn', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
    { name: 'Google', href: '#', icon: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>},
  ],
  links: [
    { name: 'About', href: '#' },
    { name: 'SDK', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
};