'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { supabase } from '@/utils/supabase/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const [weightRecords, setWeightRecords] = useState([])
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [dailyCalories, setDailyCalories] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data: weightRecords, error: weightError } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true })

    if (weightError) {
      console.error('Error fetching weight records:', weightError)
    } else {
      setWeightRecords(weightRecords)
    }

    const { data: nutritionPlan, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (nutritionError) {
      console.error('Error fetching nutrition plan:', nutritionError)
    } else {
      setNutritionPlan(nutritionPlan)
      calculateDailyCalories(nutritionPlan, weightRecords[weightRecords.length - 1])
    }
  }

  const calculateDailyCalories = (plan, latestWeight) => {
    if (!plan || !latestWeight) return

    const { gender, age, height, target_weight, target_date, activity_level } = plan
    const currentWeight = latestWeight.weight

    // BMR計算
    let bmr
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age)
    } else {
      bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age)
    }

    // 活動レベルに応じた係数
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    const totalCalories = bmr * activityMultipliers[activity_level]

    // 目標に応じた調整
    const weightDifference = target_weight - currentWeight
    const targetCalories = weightDifference > 0 ? totalCalories * 1.15 : totalCalories * 0.85

    // 目標達成期間の考慮
    const daysUntilTarget = (new Date(target_date) - new Date()) / (1000 * 60 * 60 * 24)
    const calorieAdjustment = (weightDifference * 7700) / daysUntilTarget
    const finalCalories = Math.round(targetCalories + calorieAdjustment)

    setDailyCalories({
      total: finalCalories,
      breakfast: Math.round(finalCalories * 0.25),
      lunch: Math.round(finalCalories * 0.35),
      dinner: Math.round(finalCalories * 0.30),
      snack: Math.round(finalCalories * 0.10)
    })
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/')
    }
  }

  const calculateProgress = () => {
    if (!nutritionPlan || weightRecords.length < 2) return 0
    const initialWeight = weightRecords[0].weight
    const currentWeight = weightRecords[weightRecords.length - 1].weight
    const targetWeight = nutritionPlan.target_weight
    return ((currentWeight - initialWeight) / (targetWeight - initialWeight) * 100).toFixed(2)
  }

  const progress = calculateProgress()

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">ログアウト</Button>
      <Card className="w-full max-w-4xl space-y-6">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>ダッシュボード</CardTitle>
            <CardDescription>あなたの進捗状況</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => router.push('/weight-record')}>体重を記録する</Button>
            <Button onClick={() => router.push('/meal-record')}>食事を記録する</Button>
            <Button onClick={() => router.push('/nutrition-plan')}>栄養プランを作成</Button>
          </div>
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightRecords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(date) => format(new Date(date), 'MM/dd HH:mm')}
                  label={{ value: '日付', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={(date) => format(new Date(date), 'yyyy/MM/dd HH:mm')} />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="体重" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold">目標達成度</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{progress}%達成</p>
          </div>
          {dailyCalories && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">1日あたりの推奨摂取カロリー</h3>
              <p>合計: {dailyCalories.total} kcal</p>
              <p>朝食: {dailyCalories.breakfast} kcal</p>
              <p>昼食: {dailyCalories.lunch} kcal</p>
              <p>夕食: {dailyCalories.dinner} kcal</p>
              <p>間食: {dailyCalories.snack} kcal</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
