import type { ReactNode } from 'react';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  upi_id?: string;
  total_earnings?: number;
  created_at: string;
}

export interface Template {
  id: string;
  template_name: string;
  description: string;
  price: number;
  commission_rate: number;
  category: string;
  slug: string;
  preview_image_url: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  template_id: string;
  project_name: string;
  slug: string;
  status: 'Pending Verification' | 'Active' | 'Completed' | 'Cancelled';
  proof_photo_url?: string;
  created_at: string;
  templates?: {
    template_name: string;
    price: number;
    commission_rate: number;
    preview_image_url: string;
  };
}

export interface StatCardData {
  title: string;
  value: string;
  icon: ReactNode;
}
