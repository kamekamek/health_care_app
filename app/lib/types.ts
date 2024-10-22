export interface WeightRecord {
    id: number
    user_id: string
    weight: number
    date: string
  }
  
  export interface NutritionPlan {
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