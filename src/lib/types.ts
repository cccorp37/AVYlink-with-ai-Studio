export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      ab_tests: {
        Row: {
          created_at: string;
          ended_at: string | null;
          id: string;
          name: string;
          profile_id: string;
          started_at: string | null;
          status: string;
          variant_a: Json;
          variant_a_clicks: number;
          variant_a_views: number;
          variant_b: Json;
          variant_b_clicks: number;
          variant_b_views: number;
          winner: string | null;
        };
        Insert: {
          created_at?: string;
          ended_at?: string | null;
          id?: string;
          name: string;
          profile_id: string;
          started_at?: string | null;
          status?: string;
          variant_a?: Json;
          variant_a_clicks?: number;
          variant_a_views?: number;
          variant_b?: Json;
          variant_b_clicks?: number;
          variant_b_views?: number;
          winner?: string | null;
        };
        Update: {
          created_at?: string;
          ended_at?: string | null;
          id?: string;
          name?: string;
          profile_id?: string;
          started_at?: string | null;
          status?: string;
          variant_a?: Json;
          variant_a_clicks?: number;
          variant_a_views?: number;
          variant_b?: Json;
          variant_b_clicks?: number;
          variant_b_views?: number;
          winner?: string | null;
        };
        Relationships: [];
      };
      admin_notifications: {
        Row: {
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          message: string;
          title: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          message: string;
          title: string;
          type?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          message?: string;
          title?: string;
          type?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          key_hash: string;
          key_preview: string;
          last_used_at: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key_hash: string;
          key_preview: string;
          last_used_at?: string | null;
          name?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key_hash?: string;
          key_preview?: string;
          last_used_at?: string | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      click_heatmap: {
        Row: {
          clicked_at: string;
          element_id: string | null;
          element_type: string;
          id: string;
          profile_id: string;
          viewport_height: number | null;
          viewport_width: number | null;
          x_percent: number;
          y_percent: number;
        };
        Insert: {
          clicked_at?: string;
          element_id?: string | null;
          element_type: string;
          id?: string;
          profile_id: string;
          viewport_height?: number | null;
          viewport_width?: number | null;
          x_percent: number;
          y_percent: number;
        };
        Update: {
          clicked_at?: string;
          element_id?: string | null;
          element_type?: string;
          id?: string;
          profile_id?: string;
          viewport_height?: number | null;
          viewport_width?: number | null;
          x_percent?: number;
          y_percent?: number;
        };
        Relationships: [];
      };
      custom_templates: {
        Row: {
          avatar_position: string;
          background_color: string | null;
          button_style: string;
          created_at: string;
          font_style: string;
          id: string;
          name: string;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_position?: string;
          background_color?: string | null;
          button_style?: string;
          created_at?: string;
          font_style?: string;
          id?: string;
          name?: string;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_position?: string;
          background_color?: string | null;
          button_style?: string;
          created_at?: string;
          font_style?: string;
          id?: string;
          name?: string;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      form_submissions: {
        Row: {
          block_id: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          message: string | null;
          profile_id: string;
          submitted_at: string;
        };
        Insert: {
          block_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          message?: string | null;
          profile_id: string;
          submitted_at?: string;
        };
        Update: {
          block_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          message?: string | null;
          profile_id?: string;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_submissions_block_id_fkey";
            columns: ["block_id"];
            isOneToOne: false;
            referencedRelation: "page_blocks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "form_submissions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      integrations: {
        Row: {
          config: Json;
          created_at: string;
          id: string;
          integration_id: string;
          is_connected: boolean;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          id?: string;
          integration_id: string;
          is_connected?: boolean;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          id?: string;
          integration_id?: string;
          is_connected?: boolean;
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "integrations_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      link_clicks: {
        Row: {
          clicked_at: string;
          id: string;
          link_id: string;
          referrer: string | null;
        };
        Insert: {
          clicked_at?: string;
          id?: string;
          link_id: string;
          referrer?: string | null;
        };
        Update: {
          clicked_at?: string;
          id?: string;
          link_id?: string;
          referrer?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "profile_links";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_dismissals: {
        Row: {
          dismissed_at: string;
          id: string;
          notification_id: string;
          user_id: string;
        };
        Insert: {
          dismissed_at?: string;
          id?: string;
          notification_id: string;
          user_id: string;
        };
        Update: {
          dismissed_at?: string;
          id?: string;
          notification_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_dismissals_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "admin_notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          buyer_email: string | null;
          buyer_name: string | null;
          buyer_phone: string;
          created_at: string;
          currency: string;
          failure_reason: string | null;
          id: string;
          item_id: string;
          mesomb_transaction_id: string | null;
          payment_method: string;
          payment_status: string;
          quantity: number;
          refund_status: string | null;
          refunded_at: string | null;
          seller_profile_id: string;
          total_amount: number;
          transaction_id: string | null;
          updated_at: string;
        };
        Insert: {
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone: string;
          created_at?: string;
          currency?: string;
          failure_reason?: string | null;
          id?: string;
          item_id: string;
          mesomb_transaction_id?: string | null;
          payment_method: string;
          payment_status?: string;
          quantity?: number;
          refund_status?: string | null;
          refunded_at?: string | null;
          seller_profile_id: string;
          total_amount: number;
          transaction_id?: string | null;
          updated_at?: string;
        };
        Update: {
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone?: string;
          created_at?: string;
          currency?: string;
          failure_reason?: string | null;
          id?: string;
          item_id?: string;
          mesomb_transaction_id?: string | null;
          payment_method?: string;
          payment_status?: string;
          quantity?: number;
          refund_status?: string | null;
          refunded_at?: string | null;
          seller_profile_id?: string;
          total_amount?: number;
          transaction_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "store_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_seller_profile_id_fkey";
            columns: ["seller_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      page_blocks: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          is_active: boolean;
          position: number;
          profile_id: string;
          title: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          position?: number;
          profile_id: string;
          title?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          position?: number;
          profile_id?: string;
          title?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_blocks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      page_views: {
        Row: {
          country: string | null;
          device: string | null;
          id: string;
          profile_id: string;
          referrer: string | null;
          viewed_at: string;
        };
        Insert: {
          country?: string | null;
          device?: string | null;
          id?: string;
          profile_id: string;
          referrer?: string | null;
          viewed_at?: string;
        };
        Update: {
          country?: string | null;
          device?: string | null;
          id?: string;
          profile_id?: string;
          referrer?: string | null;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_views_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_links: {
        Row: {
          click_count: number;
          created_at: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          position: number;
          profile_id: string;
          title: string;
          url: string;
        };
        Insert: {
          click_count?: number;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          position?: number;
          profile_id: string;
          title: string;
          url: string;
        };
        Update: {
          click_count?: number;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          position?: number;
          profile_id?: string;
          title?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_links_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_position: string;
          avatar_url: string | null;
          background_color: string | null;
          background_image_url: string | null;
          bio: string | null;
          button_style: string;
          cover_url: string | null;
          created_at: string;
          custom_domain: string | null;
          display_name: string | null;
          facebook_pixel_id: string | null;
          favicon_url: string | null;
          font_style: string;
          google_analytics_id: string | null;
          hide_branding: boolean;
          id: string;
          is_verified: boolean;
          linkedin_insight_tag: string | null;
          pinterest_tag_id: string | null;
          plan: string;
          seo_description: string | null;
          seo_title: string | null;
          snapchat_pixel_id: string | null;
          social_links: Json | null;
          status: string;
          theme: string;
          tiktok_pixel_id: string | null;
          updated_at: string;
          user_id: string;
          username: string | null;
          verified_badge_style: string;
          website: string | null;
        };
        Insert: {
          avatar_position?: string;
          avatar_url?: string | null;
          background_color?: string | null;
          background_image_url?: string | null;
          bio?: string | null;
          button_style?: string;
          cover_url?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          display_name?: string | null;
          facebook_pixel_id?: string | null;
          favicon_url?: string | null;
          font_style?: string;
          google_analytics_id?: string | null;
          hide_branding?: boolean;
          id?: string;
          is_verified?: boolean;
          linkedin_insight_tag?: string | null;
          pinterest_tag_id?: string | null;
          plan?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          snapchat_pixel_id?: string | null;
          social_links?: Json | null;
          status?: string;
          theme?: string;
          tiktok_pixel_id?: string | null;
          updated_at?: string;
          user_id: string;
          username?: string | null;
          verified_badge_style?: string;
          website?: string | null;
        };
        Update: {
          avatar_position?: string;
          avatar_url?: string | null;
          background_color?: string | null;
          background_image_url?: string | null;
          bio?: string | null;
          button_style?: string;
          cover_url?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          display_name?: string | null;
          facebook_pixel_id?: string | null;
          favicon_url?: string | null;
          font_style?: string;
          google_analytics_id?: string | null;
          hide_branding?: boolean;
          id?: string;
          is_verified?: boolean;
          linkedin_insight_tag?: string | null;
          pinterest_tag_id?: string | null;
          plan?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          snapchat_pixel_id?: string | null;
          social_links?: Json | null;
          status?: string;
          theme?: string;
          tiktok_pixel_id?: string | null;
          updated_at?: string;
          user_id?: string;
          username?: string | null;
          verified_badge_style?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      store_items: {
        Row: {
          category: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          header_text: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          item_type: string;
          name: string;
          price: number;
          profile_id: string;
          redirect_url: string | null;
          seller_email: string | null;
          seller_name: string | null;
          seller_phone: string | null;
          stock: number | null;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          header_text?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          item_type?: string;
          name: string;
          price?: number;
          profile_id: string;
          redirect_url?: string | null;
          seller_email?: string | null;
          seller_name?: string | null;
          seller_phone?: string | null;
          stock?: number | null;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          header_text?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          item_type?: string;
          name?: string;
          price?: number;
          profile_id?: string;
          redirect_url?: string | null;
          seller_email?: string | null;
          seller_name?: string | null;
          seller_phone?: string | null;
          stock?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_items_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          expires_at: string | null;
          id: string;
          payment_method: string | null;
          plan: string;
          profile_id: string;
          started_at: string;
          status: string;
          transaction_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expires_at?: string | null;
          id?: string;
          payment_method?: string | null;
          plan?: string;
          profile_id: string;
          started_at?: string;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expires_at?: string | null;
          id?: string;
          payment_method?: string | null;
          plan?: string;
          profile_id?: string;
          started_at?: string;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          priority: string;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          priority?: string;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          priority?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          invited_by: string;
          profile_id: string;
          role: string;
          status: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          invited_by: string;
          profile_id: string;
          role?: string;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          invited_by?: string;
          profile_id?: string;
          role?: string;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ticket_replies: {
        Row: {
          created_at: string;
          id: string;
          is_admin: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          message: string;
          ticket_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          message?: string;
          ticket_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "support_tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          description: string | null;
          failure_reason: string | null;
          fee_amount: number | null;
          id: string;
          mesomb_transaction_id: string | null;
          net_amount: number | null;
          payment_method: string | null;
          phone_number: string | null;
          processed_at: string | null;
          provider_event_id: string | null;
          recipient_name: string | null;
          reference: string | null;
          status: string;
          type: string;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          failure_reason?: string | null;
          fee_amount?: number | null;
          id?: string;
          mesomb_transaction_id?: string | null;
          net_amount?: number | null;
          payment_method?: string | null;
          phone_number?: string | null;
          processed_at?: string | null;
          provider_event_id?: string | null;
          recipient_name?: string | null;
          reference?: string | null;
          status?: string;
          type: string;
          user_id: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          failure_reason?: string | null;
          fee_amount?: number | null;
          id?: string;
          mesomb_transaction_id?: string | null;
          net_amount?: number | null;
          payment_method?: string | null;
          phone_number?: string | null;
          processed_at?: string | null;
          provider_event_id?: string | null;
          recipient_name?: string | null;
          reference?: string | null;
          status?: string;
          type?: string;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          balance: number;
          created_at: string;
          currency: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          created_at: string;
          event_id: string;
          event_type: string | null;
          id: string;
          payload: Json | null;
          processed_at: string;
          provider: string;
          reference: string | null;
          result: string | null;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          event_type?: string | null;
          id?: string;
          payload?: Json | null;
          processed_at?: string;
          provider?: string;
          reference?: string | null;
          result?: string | null;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          event_type?: string | null;
          id?: string;
          payload?: Json | null;
          processed_at?: string;
          provider?: string;
          reference?: string | null;
          result?: string | null;
        };
        Relationships: [];
      };
      webhooks: {
        Row: {
          created_at: string;
          events: string[];
          id: string;
          is_active: boolean;
          secret: string | null;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          events?: string[];
          id?: string;
          is_active?: boolean;
          secret?: string | null;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          events?: string[];
          id?: string;
          is_active?: boolean;
          secret?: string | null;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      withdrawal_notifications: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          display_name: string | null;
          fee_amount: number;
          id: string;
          net_amount: number;
          recipient_name: string | null;
          recipient_phone: string | null;
          recipient_service: string | null;
          status: string;
          user_id: string;
          username: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          display_name?: string | null;
          fee_amount: number;
          id?: string;
          net_amount: number;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          recipient_service?: string | null;
          status?: string;
          user_id: string;
          username?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          display_name?: string | null;
          fee_amount?: number;
          id?: string;
          net_amount?: number;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          recipient_service?: string | null;
          status?: string;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
