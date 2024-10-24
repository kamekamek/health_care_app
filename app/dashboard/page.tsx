'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/utils/supabase/supabase'
import { NutritionPlan } from '../lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [weightRecords, setWeightRecords] = useState([])
  const [mealRecords, setMealRecords] = useState([])
  const [nutritionPlans, setNutritionPlans] = useState([])

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

    if (weightError) {
      console.error('Error fetching weight records:', weightError)
    } else {
      setWeightRecords(weightRecords)
    }

    const { data: mealRecords, error: mealError } = await supabase
      .from('meal_records')
      .select('*')
      .eq('user_id', user.id)

    if (mealError) {
      console.error('Error fetching meal records:', mealError)
    } else {
      setMealRecords(mealRecords)
    }

    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', user.id)

    if (nutritionError) {
      console.error('Error fetching nutrition plans:', nutritionError)
    } else {
      setNutritionPlans(nutritionPlans)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl space-y-6">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>ダッシュボード</CardTitle>
            <CardDescription>あなたの進捗状況</CardDescription>
          </div>
          <Button onClick={handleLogout}>ログアウト</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => router.push('/weight-record')}>体重を記録する</Button>
            <Button onClick={() => router.push('/meal-record')}>食事を記録する</Button>
            <Button onClick={() => router.push('/nutrition-plan')}>栄養プランを作成</Button>
          </div>
          {/* ここに体重の推移グラフやカロリー情報を表示 */}
        </CardContent>
      </Card>
    </div>
  )
}
