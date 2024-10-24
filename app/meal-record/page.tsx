'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import MealRecordForm from '@/app/components/MealRecordForm'

export default function MealRecordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleMealRecord = async (mealRecord: { breakfast: string; lunch: string; dinner: string; snack: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('meal_records')
      .insert({ ...mealRecord, user_id: user.id })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard') // 保存後にダッシュボードに戻る
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">食事記録</h1>
      {error && <p className="text-red-500">{error}</p>}
      <MealRecordForm onSubmit={handleMealRecord} />
    </div>
  )
}
