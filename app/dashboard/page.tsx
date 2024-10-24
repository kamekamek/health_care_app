'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { supabase } from '@/utils/supabase/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [weightRecords, setWeightRecords] = useState([])
  const [nutritionPlan, setNutritionPlan] = useState(null)

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

    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (nutritionError) {
      console.error('Error fetching nutrition plans:', nutritionError)
    } else {
      setNutritionPlan(nutritionPlans);
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

  const latestWeightRecord = weightRecords[weightRecords.length - 1];
  const targetWeight = nutritionPlan?.target_weight;
  const currentWeight = latestWeightRecord?.weight;

  const calculateProgress = (targetWeight: number, currentWeight: number) => {
    return ((currentWeight / targetWeight) * 100).toFixed(2);
  };

  const progress = targetWeight && currentWeight ? calculateProgress(targetWeight, currentWeight) : 0;

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
                <XAxis dataKey="recorded_at" label={{ value: '日付', position: 'bottom' }} />
                <YAxis label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" />
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
          <div className="mt-8">
            <h3 className="text-lg font-semibold">1日あたりの摂取カロリー</h3>
            <p>目標体重: {targetWeight} kg</p>
            <p>現在の体重: {currentWeight} kg</p>
            {/* 摂取カロリーの内訳を表示 */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
