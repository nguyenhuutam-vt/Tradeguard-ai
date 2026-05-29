import type { TradeEmotion } from "@/lib/journal/types";
import type { TradeDirection } from "@/lib/trading/calculate-trade";

export type TradesInsert = {
  user_id: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  leverage: number;
  result_pnl: number;
  emotion: TradeEmotion;
  notes?: string | null;
};

export type TradesRow = {
  id: string;
  user_id: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  leverage: number;
  result_pnl: number;
  emotion: TradeEmotion;
  notes: string | null;
  created_at: string;
};

export type WatchlistsInsert = {
  user_id: string;
  symbol: string;
};

export type WatchlistsRow = {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      watchlists: {
        Row: WatchlistsRow;
        Insert: WatchlistsInsert;
        Update: Partial<WatchlistsInsert>;
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      trades: {
        Row: TradesRow;
        Insert: TradesInsert;
        Update: Partial<TradesInsert>;
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
