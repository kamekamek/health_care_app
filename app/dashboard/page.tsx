'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import CalorieSuggestion from '../components/CaloriesSuggestion'
import MealRecordForm from '../components/MealRecordForm'
import MealRecordList from '../components/MealRecordList'
import NutritionPlanDisplay from '../components/NutritionPlanDisplay'
import WeightRecordForm from '../components/WeightRecordForm'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [mealRecords, setMealRecords] = useState([])
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [dailyCalories, setDailyCalories] = useState(2000) // Default value
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
      .from('meal_plans')
      .select('*')
      .eq('user_id', 

 userId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      setNutritionPlan(data[0])
    }
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
      .insert({ weight, user_id: user.id })
    if (!error) {
      // You might want to update some state or refetch data here
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
            <NutritionPlanDisplay plan={nutritionPlan} />
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
          </div>
        </div>
      </div>
    </div>
  )
}