'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { supabase } from '@/utils/supabase/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { WeightRecord, NutritionPlan } from '../lib/types'

interface DailyCalories {
  total: number;
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

export default function DashboardPage() {
  const router = useRouter()
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [dailyCalories, setDailyCalories] = useState<DailyCalories | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
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
      const formattedWeightRecords: WeightRecord[] = weightRecords.map(record => ({
        recorded_at: record.recorded_at ?? new Date().toISOString(),
        id: record.id,
        user_id: record.user_id ?? '',
        weight: record.weight ?? 0,
      }))
      setWeightRecords(formattedWeightRecords)

      const { data: nutritionPlanData, error: nutritionError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (nutritionError) {
        console.error('Error fetching nutrition plan:', nutritionError)
      } else {
        setNutritionPlan(nutritionPlanData)
        if (formattedWeightRecords.length > 0) {
          calculateDailyCalories(nutritionPlanData, formattedWeightRecords[formattedWeightRecords.length - 1])
        }
      }
    }

    setLoading(false)
  }

  const calculateDailyCalories = (plan: NutritionPlan, latestWeight: WeightRecord) => {
    if (!plan || !latestWeight) return

    const { gender, age, height, target_weight, target_date, activity_level } = plan
    const currentWeight = latestWeight.weight

    let bmr
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age)
    } else {
      bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age)
    }

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    const totalCalories = bmr * activityMultipliers[activity_level]

    const weightDifference = target_weight - currentWeight
    const targetCalories = weightDifference > 0 ? totalCalories * 1.15 : totalCalories * 0.85

    const daysUntilTarget = (new Date(target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
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
    return Number(((currentWeight - initialWeight) / (targetWeight - initialWeight) * 100).toFixed(2))
  }

  const progress = calculateProgress()

  const getEncouragementMessage = () => {
    if (progress > 90) return "素晴らしい！目標達成まであと一歩です！"
    if (progress > 70) return "順調に進んでいます。このまま頑張りましょう！"
    if (progress > 50) return "半分以上達成しました。あきらめずに続けましょう！"
    if (progress > 30) return "良いスタートです。一歩ずつ前進しています！"
    return "始めたばかりですね。一緒に頑張りましょう！"
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">ログアウト</Button>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-4xl space-y-6 bg-white/90 backdrop-blur-md">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-purple-700">ダッシュボード</CardTitle>
              <CardDescription>あなたの進捗状況</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Button onClick={() => router.push('/weight-record')} className="bg-blue-500 hover:bg-blue-600">体重を記録する</Button>
              <Button onClick={() => router.push('/meal-record')} className="bg-green-500 hover:bg-green-600">食事を記録する</Button>
              <Button onClick={() => router.push('/nutrition-plan')} className="bg-yellow-500 hover:bg-yellow-600">栄養プランを作成</Button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightRecords}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="recorded_at" 
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    label={{ value: '日付', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip labelFormatter={(date) => format(new Date(date), 'yyyy/MM/dd HH:mm')} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" name="体重" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold mb-2">目標達成度</h3>
              <Progress value={parseFloat(progress.toString())} className="h-4" />
              <p className="text-right mt-1">{progress}% 達成</p>
              <p className="text-center mt-2 font-bold text-lg">{getEncouragementMessage()}</p>
            </motion.div>
            {dailyCalories && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-orange-400 to-red-500 p-6 rounded-lg text-white"
              >
                <h3 className="text-2xl font-bold mb-4">1日あたりの推奨摂取カロリー</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg">合計: <span className="text-3xl font-bold">{dailyCalories.total}</span> kcal</p>
                  </div>
                  <div>
                    <p>朝食: {dailyCalories.breakfast} kcal</p>
                    <p>昼食: {dailyCalories.lunch} kcal</p>
                    <p>夕食: {dailyCalories.dinner} kcal</p>
                    <p>間食: {dailyCalories.snack} kcal</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
