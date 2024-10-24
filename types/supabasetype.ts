export type Database = {
  public: {
    Tables: {
      nutrition_plans: {
        Row: {
          id: number
          user_id: string
          gender: string
          age: number
          height: number
          current_weight: number
          target_weight: number
          target_date: string
          activity_level: string
          daily_calories: number
          breakfast: string | null
          lunch: string | null
          dinner: string | null
          snack: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          gender: string
          age: number
          height: number
          current_weight: number
          target_weight: number
          target_date: string
          activity_level: string
          daily_calories: number
          breakfast?: string | null
          lunch?: string | null
          dinner?: string | null
          snack?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          gender?: string
          age?: number
          height?: number
          current_weight?: number
          target_weight?: number
          target_date?: string
          activity_level?: string
          daily_calories?: number
          breakfast?: string | null
          lunch?: string | null
          dinner?: string | null
          snack?: string | null
          created_at?: string
        }
      }
      // 他のテーブルの定義もここに追加
    }
  }
}
