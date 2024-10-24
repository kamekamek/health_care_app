'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import CalorieSuggestion from '../components/CaloriesSuggestion'
import MealRecordForm from '../components/MealRecordForm'
import MealRecordList from '../components/MealRecordList'
import NutritionPlanDisplay from '../components/NutritionPlanDisplay'
import WeightRecordForm from '../components/WeightRecordForm'
import WeightRecordList from '../components/WeightRecordList' // 重複を削除
import { MealRecord, NutritionPlan, WeightRecord } from '@/app/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([])
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [dailyCalories, setDailyCalories] = useState<number | null>(null)
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchMealRecords(user.id)
        fetchNutritionPlan(user.id)
        fetchWeightRecords(user.id)
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
        recorded_at: new Date().toISOString()
      })
    if (!error) {
      fetchWeightRecords(user.id)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
      <button onClick={handleLogout} className="mb-4 text-red-500">ログアウト</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">体重の推移</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightRecords}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="recorded_at" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">現在の体重と目標体重</h2>
          <p>現在の体重: {weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : '記録なし'} kg</p>
          <p>目標体重: {nutritionPlan ? nutritionPlan.target_weight : '設定なし'} kg</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">今日の摂取カロリー</h2>
          <CalorieSuggestion dailyCalories={dailyCalories} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">食事記録</h2>
          <MealRecordList mealRecords={mealRecords} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">栄養プラン</h2>
          {nutritionPlan ? (
            <NutritionPlanDisplay plan={nutritionPlan} />
          ) : (
            <p>栄養プランがありません。</p>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">体重を記録する</h2>
          <WeightRecordForm onSubmit={handleWeightRecord} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">食事を記録する</h2>
          <MealRecordForm onSubmit={handleMealRecord} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">栄養プランを作成</h2>
          <button onClick={() => router.push('/nutrition-plan')} className="bg-blue-500 text-white px-4 py-2 rounded">栄養プラン作成</button>
        </div>
      </div>
    </div>
  )
}
