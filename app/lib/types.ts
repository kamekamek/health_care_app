import { ReactNode } from "react"

export interface WeightRecord {
    recorded_at: string | number | Date
    id: number
    user_id: string
    weight: number
    date: string
}

export interface NutritionPlan {
    gender: string
    age: ReactNode
    height: ReactNode
    current_weight: ReactNode
    target_weight: ReactNode
    target_date: string | number | Date
    activity_level: ReactNode
    daily_calories: ReactNode
    id: number
    user_id: string
    dailyCalories: number
    mealPlan: {
      breakfast: string
      lunch: string
      dinner: string
      snack: string
    }
    created_at: string
}

export interface MealRecord {
  id: number;
  user_id: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snack: string | null;
  created_at: string;
  calories: number; // カロリーを追加
}
