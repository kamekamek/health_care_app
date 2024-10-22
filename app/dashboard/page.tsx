'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import WeightRecordForm from '../components/WeightRecordForm'
import NutritionPlanDisplay from '../components/NutritionPlanDisplay'
import { WeightRecord, NutritionPlan } from '../lib/types'

export default function Dashboard() {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        fetchWeightRecords()
        fetchNutritionPlan()
      }
    }
    checkUser()
  }, [router])

  const fetchWeightRecords = async () => {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .order('date', { ascending: false })
    if (data) {
      setWeightRecords(data)
    }
  }

  const fetchNutritionPlan = async () => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      setNutritionPlan(data[0])
    }
  }

  const handleWeightRecord = async (weight: number) => {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({ weight, date: new Date().toISOString() })
    if (!error) {
      fetchWeightRecords()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">ダッシュボード</h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">体重記録</h2>
          <WeightRecordForm onSubmit={handleWeightRecord} />
          <ul className="mt-4 space-y-2">
            {weightRecords.map((record) => (
              <li key={record.id} className="bg-white rounded-lg p-4 shadow">
                {new Date(record.date).toLocaleDateString()}: {record.weight} kg
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">栄養プラン</h2>
          {nutritionPlan ? (
            <NutritionPlanDisplay plan={nutritionPlan} />
          ) : (
            <p>栄養プランがまだ作成されていません。</p>
          )}
        </div>
      </div>
    </div>
  )
}