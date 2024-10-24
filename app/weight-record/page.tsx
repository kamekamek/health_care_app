'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import WeightRecordForm from '@/app/components/WeightRecordForm'

export default function WeightRecordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleWeightRecord = async (weight: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('weight_records')
      .insert({
        weight,
        user_id: user.id,
        recorded_at: new Date().toISOString()
      })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard') // 保存後にダッシュボードに戻る
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">体重記録</h1>
      {error && <p className="text-red-500">{error}</p>}
      <WeightRecordForm onSubmit={handleWeightRecord} />
    </div>
  )
}
