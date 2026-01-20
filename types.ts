
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Product {
  name: string;
  price: string;
  features: string[];
  support: string;
  delivery: string;
  image: string;
  link: string;
}

export enum BotStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  ERROR = 'ERROR'
}

export interface Step {
  title: string;
  description: string;
  warning?: string;
  isImportant?: boolean;
}
