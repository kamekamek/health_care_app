'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import CalorieSuggestion from '../components/CaloriesSuggestion'
import MealRecordForm from '../components/MealRecordForm'
import MealRecordList from '../components/MealRecordList'
import NutritionPlanDisplay from '../components/NutritionPlanDisplay'
import WeightRecordForm from '../components/WeightRecordForm'
import WeightRecordList from '../components/WeightRecordList'
import { MealRecord, NutritionPlan } from '@/app/lib/types'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([])
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [dailyCalories, setDailyCalories] = useState<number | null>(null)
  const [weightRecords, setWeightRecords] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchMealRecords(user.id)
        fetchNutritionPlan(user.id)
      } else {
        router.push('/auth/login')
      }
    }
    getUser()
  }, [router])

  const fetchMealRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from('meal_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) {
      setMealRecords(data)
    }
  }

  const fetchNutritionPlan = async (userId: string) => {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      setNutritionPlan(data[0])
      calculateDailyCalories(data[0])
    }
  }

  const calculateDailyCalories = (plan: NutritionPlan) => {
    const bmr = plan.gender === 'male'
      ? 66.47 + (13.75 * plan.current_weight) + (5.003 * plan.height) - (6.755 * plan.age)
      : 655.1 + (9.563 * plan.current_weight) + (1.850 * plan.height) - (4.676 * plan.age)

    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    }[plan.activity_level] || 1.2

    const daysUntilTarget = Math.ceil(
      (new Date(plan.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const weightChange = plan.target_weight - plan.current_weight;
    const CALORIES_PER_KG = 7700;
    const dailyCalorieAdjustment = (weightChange * CALORIES_PER_KG) / daysUntilTarget;

    const recommendedDailyCalories = Math.round(bmr * activityMultiplier + dailyCalorieAdjustment);
    setDailyCalories(recommendedDailyCalories)
  }

  const handleMealRecord = async (mealRecord: any) => {
    const { data, error } = await supabase
      .from('meal_records')
      .insert({ ...mealRecord, user_id: user.id })
    if (!error) {
      fetchMealRecords(user.id)
    }
  }

  const handleWeightRecord = async (weight: number) => {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({
        weight,
        user_id: user.id,
        recorded_at: new Date().toISOString()  // recorded_at カラムを使用
      })
    if (!error) {
      fetchWeightRecords(user.id) // 体重記録を再取得する関数を呼び出す
    }
  }

  const fetchWeightRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true })
    if (data) {
      setWeightRecords(data)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Meal Records</h2>
          <MealRecordForm onSubmit={handleMealRecord} />
          <div className="mt-8">
            <MealRecordList mealRecords={mealRecords} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Nutrition Plan</h2>
          {nutritionPlan ? (
            <>
              <NutritionPlanDisplay plan={nutritionPlan} />
              <div className="mt-4">
                <h3 className="text-xl font-semibold">推奨1日摂取カロリー</h3>
                <p>{dailyCalories ? `${dailyCalories} kcal` : '計算中...'}</p>
              </div>
            </>
          ) : (
            <p>No nutrition plan available.</p>
          )}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Calorie Suggestion</h2>
            <CalorieSuggestion dailyCalories={dailyCalories} />
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Weight Record</h2>
            <WeightRecordForm onSubmit={handleWeightRecord} />
            <WeightRecordList weightRecords={weightRecords} /> {/* 体重記録リストを表示 */}
          </div>
        </div>
      </div>
    </div>
  )
}
