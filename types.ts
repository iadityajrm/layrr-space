import type { ReactNode } from 'react';

export interface NavItem {
  name: string;
  icon: ReactNode;
}

export interface StatCardData {
  title: string;
  value: string;
  icon: ReactNode;
}

export interface Activity {
  description: string;
  timestamp: string;
  icon: ReactNode;
}

export interface Project {
  id: string;
  name:string;
  slug: string;
  templateType: string;
  createdDate: string;
  status: 'Active' | 'Pending Verification' | 'Completed' | 'Archived';
  brandName: string;
  proofImageUrl: string | null;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  integrations: string[];
  price: number;
}

export interface User {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  mobile: string;
  upiId: string;
  totalEarnings: number;
}