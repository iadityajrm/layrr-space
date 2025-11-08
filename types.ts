export interface Template {
      id: string;
      created_at: string;
      title: string;
      description: string;
      category: string;
      template_category: string; // Field name in database
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
      slug?: string | null;
      field_mapping?: Record<string, string> | null; // New field for dynamic template data
    }

    export interface Project {
      id: string;
      user_id: string;
      template_id: string;
      project_name: string;
      slug: string;
      status: string;
      proof_photo_url?: string | null;
      created_at?: string;
      updated_at?: string;
      template_category?: string | null;
      templates?: Template | null; // Joined from templates table
      business_name?: string | null;
      logo_url?: string | null;
      theme_color?: string | null;
      redirect_url?: string | null;
      question_title?: string | null;
      internal_feedback_endpoint?: string | null;
      qr_code_url?: string | null;
      data1?: string | null;
      data2?: string | null;
      data3?: string | null;
      data4?: string | null;
      data5?: string | null;
      data6?: string | null;
      data7?: string | null;
      data8?: string | null;
    }

    export interface Profile {
      id: string;
      full_name?: string | null;
      name?: string | null; // Added for backward compatibility
      email: string;
      upi_id?: string | null;
      phone_number?: string | null;
      total_earnings?: number;
      created_at?: string;
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
