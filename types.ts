export interface Template {
      id: string;
      created_at: string;
      title: string;
      description: string;
      category: string;
      price: number | null;
      commission_rate: number | null;
      preview_url: string | null;
  // optional fields used in UI
  template_name?: string | null;
  instructions?: string | null;
  use_cases?: string | null;
  marketing_info?: string | null;
  template_url?: string | null;
      is_featured: boolean;
    }

    export interface Project {
      id: string;
      user_id: string;
      template_id?: string;
      // visible title for the assignment / project
      title?: string | null;
      // public slug and url for the review page
      slug?: string | null;
      public_url?: string | null;
      status: string;
      // optional fields
      proof_photo_url?: string | null;
      created_at?: string;
      updated_at?: string;
      // joined template info
      assignment_id?: string;
      templates?: Template[] | Template | null; // Joined from templates table
    }

    export interface Assignment extends Project {
      assigned_at?: string | null;
  template_id?: string;
    }

    export interface Profile {
      id: string;
      user_id?: string;
      name: string;
      email: string;
      role?: string;
      created_at?: string;
      last_login?: string;
      phone_number?: string;
      upi_id?: string;
      total_earnings?: number;
    }

    export interface StatCardData {
      title: string;
      value: string;
      icon: any;
    }

    export interface Activity {
      description: string;
      timestamp: string;
      icon?: any;
    }

    export interface ReviewSettings {
      id: string;
      assignment_id: string;
      redirect_url_high_rating?: string | null;
      internal_feedback_config?: string | null; // could be text or JSON endpoint
      theme_color?: string | null;
      logo_url?: string | null;
      slug?: string | null;
      public_url?: string | null;
      created_at?: string;
      updated_at?: string;
    }
