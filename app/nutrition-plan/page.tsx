'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabase'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

export default function NutritionPlanPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    targetDate: '',
    activityLevel: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('nutrition_plans')
      .insert({
        user_id: user.id,
        gender: formData.gender,
        age: Number(formData.age),
        height: Number(formData.height),
        current_weight: Number(formData.currentWeight),
        target_weight: Number(formData.targetWeight),
        target_date: formData.targetDate,
        activity_level: formData.activityLevel,
        daily_calories: calculateDailyCalories() // カロリー計算関数を呼び出す
      })

    if (!error) {
      router.push('/dashboard')
    } else {
      // エラーハンドリングを追加することを推奨
      console.error(error)
    }
  }

  // 日々のカロリー計算ロジックを関数化
  const calculateDailyCalories = (): number => {
    const bmr = formData.gender === 'male'
      ? 66.47 + (13.75 * Number(formData.currentWeight)) + (5.003 * Number(formData.height)) - (6.755 * Number(formData.age))
      : 655.1 + (9.563 * Number(formData.currentWeight)) + (1.850 * Number(formData.height)) - (4.676 * Number(formData.age))

    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    }[formData.activityLevel] || 1.2

    const daysUntilTarget = Math.ceil(
      (new Date(formData.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const weightChange = Number(formData.targetWeight) - Number(formData.currentWeight);
    const CALORIES_PER_KG = 7700;
    const dailyCalorieAdjustment = (weightChange * CALORIES_PER_KG) / daysUntilTarget;

    const recommendedDailyCalories = Math.round(bmr * activityMultiplier + dailyCalorieAdjustment);
    return recommendedDailyCalories;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">栄養プラン作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="age">年齢</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="gender">性別</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="性別を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">男性</SelectItem>
              <SelectItem value="female">女性</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="height">身長 (cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="currentWeight">現在の体重 (kg)</Label>
          <Input
            id="currentWeight"
            type="number"
            step="0.1"
            value={formData.currentWeight}
            onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="targetWeight">目標体重 (kg)</Label>
          <Input
            id="targetWeight"
            type="number"
            step="0.1"
            value={formData.targetWeight}
            onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="targetDate">目標達成日</Label>
          <Input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="activityLevel">活動レベル</Label>
          <Select
            value={formData.activityLevel}
            onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="活動レベルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">座り仕事が多い</SelectItem>
              <SelectItem value="light">軽い運動をする</SelectItem>
              <SelectItem value="moderate">中程度の運動をする</SelectItem>
              <SelectItem value="active">激しい運動をする</SelectItem>
              <SelectItem value="veryActive">非常に激しい運動をする</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">栄養プランを作成</Button>
      </form>
    </div>
  )
}
