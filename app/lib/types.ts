import { ReactNode } from "react"

export interface WeightRecord {
    recorded_at: string | number | Date
    id: string // UUIDに変更
    user_id: string
    weight: number
    date: string
}

export interface NutritionPlan {
    gender: string
    age: number // ReactNodeからnumberに変更
    height: number // ReactNodeからnumberに変更
    current_weight: number // ReactNodeからnumberに変更
    target_weight: number // ReactNodeからnumberに変更
    target_date: string | number | Date
    activity_level: string // ReactNodeからstringに変更
    daily_calories: number // ReactNodeからnumberに変更
    id: string // UUIDに変更
    user_id: string
    mealPlan: {
      breakfast: string
      lunch: string
      dinner: string
      snack: string
    }
    created_at: string
}

export interface MealRecord {
  id: string; // UUIDに変更
  user_id: string;
  meal_type: string; // meal_typeを追加
  food: string;
  calories: number;
  recorded_at: string; // recorded_atを追加
}
