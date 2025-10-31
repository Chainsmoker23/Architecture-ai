export interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
  locked?: boolean;
  color?: string;
}

export interface Link {
  id: string;
  source: string | Node;
  target: string | Node;
  label?: string;
  style?: 'solid' | 'dotted' | 'dashed';
  color?: string;
}

export interface Container {
  id:string;
  label: string;
  type: 'region' | 'availability-zone' | 'tier';
  x: number;
  y: number;
  width: number;
  height: number;
  childNodeIds: string[];
  description?: string;
  color?: string;
}

export interface DiagramData {
  title: string;
  architectureType: string;
  nodes: Node[];
  links: Link[];
  containers?: Container[];
}

export enum IconType {
  // --- Standard AWS ---
  AwsEc2 = 'aws-ec2',
  AwsS3 = 'aws-s3',
  AwsRds = 'aws-rds',
  AwsLambda = 'aws-lambda',
  AwsApiGateway = 'aws-api-gateway',
  AwsLoadBalancer = 'aws-load-balancer',
  AwsCloudfront = 'aws-cloudfront',
  AwsEcs = 'aws-ecs',
  
  // --- Extended AWS ---
  AwsDynamoDb = 'aws-dynamodb',
  AwsSns = 'aws-sns',
  AwsSqs = 'aws-sqs',
  AwsEventbridge = 'aws-eventbridge',
  AwsCloudwatch = 'aws-cloudwatch',

  // --- Standard Azure ---
  AzureVm = 'azure-vm',
  AzureBlobStorage = 'azure-blob-storage',
  AzureSqlDatabase = 'azure-sql-database',

  // --- Extended Azure ---
  AzureAppService = 'azure-app-service',
  AzureFunctionApp = 'azure-function-app',
  AzureServiceBus = 'azure-service-bus',

  // --- Standard GCP ---
  GcpComputeEngine = 'gcp-compute-engine',
  GcpCloudStorage = 'gcp-cloud-storage',
  GcpCloudSql = 'gcp-cloud-sql',

  // --- Extended GCP ---
  GcpBigquery = 'gcp-bigquery',
  GcpPubsub = 'gcp-pubsub',

  // --- Containers & Orchestration ---
  Kubernetes = 'kubernetes',
  Docker = 'docker',

  // --- Messaging & Integration ---
  Kafka = 'kafka',
  MessageQueue = 'message-queue',
  EventBus = 'event-bus',
  ServiceMesh = 'service-mesh',

  // --- Analytics & Monitoring ---
  Monitoring = 'monitoring',
  Logging = 'logging',

  // --- Blockchain / Web3 ---
  BlockchainNode = 'blockchain-node',
  SmartContract = 'smart-contract',
  Wallet = 'wallet',
  Oracle = 'oracle',
  Ipfs = 'ipfs',
  
  // --- Development & Web ---
  Javascript = 'javascript',
  Nginx = 'nginx',
  ReactJs = 'react-js',
  NodeJs = 'node-js',
  Python = 'python',
  GoLang = 'go-lang',
  
  // --- Generic ---
  User = 'user',
  Database = 'database',
  WebServer = 'web-server',
  Api = 'api',
  Mobile = 'mobile',
  WebApp = 'web-app',
  LoadBalancer = 'load-balancer',
  Firewall = 'firewall',
  Cache = 'cache',
  Generic = 'generic',
}