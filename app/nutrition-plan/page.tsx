'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '@/utils/supabase/supabase'
import { NutritionPlan } from '../lib/types'

export default function NutritionPlanPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<NutritionPlan>({
    age: 0,
    gender: '',
    height: 0,
    current_weight: 0,
    target_weight: 0,
    target_date: '',
    activity_level: '',
    id: 0,
    user_id: '',
    mealPlan: {
      breakfast: '',
      lunch: '',
      dinner: '',
      snack: ''
    },
    created_at: '',
    daily_calories: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNutritionPlan()
  }, [])

  const fetchNutritionPlan = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('nutrition_plans') // 型引数を削除
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching nutrition plan:', error)
    } else if (data) {
      const nutritionPlan: NutritionPlan = {
        ...data,
        mealPlan: {
          breakfast: data.breakfast ?? '',
          lunch: data.lunch ?? '',
          dinner: data.dinner ?? '',
          snack: data.snack ?? '',
        },
        daily_calories: data.daily_calories ?? 0
      }
      setNutritionPlan(nutritionPlan)
      setFormData({
        age: data.age,
        gender: data.gender,
        height: data.height,
        current_weight: data.current_weight,
        target_weight: data.target_weight,
        target_date: data.target_date,
        activity_level: data.activity_level,
        id: data.id,
        user_id: data.user_id,
        created_at: data.created_at,
        daily_calories: data.daily_calories ?? 0,
        mealPlan: { // mealPlanを追加
          breakfast: data.breakfast ?? '',
          lunch: data.lunch ?? '',
          dinner: data.dinner ?? '',
          snack: data.snack ?? '',
        }
      })
    }
    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prevData => ({ ...prevData, [field]: value }))
  }

  const calculateDailyCalories = () => {
    const bmr = 10 * formData.current_weight + 6.25 * formData.height - 5 * formData.age + (formData.gender === 'male' ? 5 : -161)
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    return Math.round(bmr * activityMultipliers[formData.activity_level])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const daily_calories = calculateDailyCalories()

    const { error } = await supabase
      .from('nutrition_plans')
      .upsert([{ user_id: user.id, ...formData, daily_calories }]) // user_idを含めないように修正

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">ログアウト</Button>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="w-full bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {nutritionPlan ? '栄養プラン更新' : '栄養プラン作成'}
            </CardTitle>
            <CardDescription className="text-center">
              {nutritionPlan ? 'あなたの栄養プランを更新しましょう' : 'あなたの情報を入力して、最適な栄養プランを作成しましょう'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">年齢</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age.toString()} // 数値を文字列に変換
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))} // 文字列を数値に変換
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性別</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)} value={formData.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="性別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">身長 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height.toString()} // 数値を文字���に変換
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value))} // 文字列を数値に変換
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_weight">現在の体重 (kg)</Label>
                  <Input
                    id="current_weight"
                    type="number"
                    step="0.1"
                    value={formData.current_weight.toString()} // 数値を文字列に変換
                    onChange={(e) => handleInputChange('current_weight', parseFloat(e.target.value))} // 文字列を数値に変換
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_weight">目標体重 (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    value={formData.target_weight.toString()} // 数値を文字列に変換
                    onChange={(e) => handleInputChange('target_weight', parseFloat(e.target.value))} // 文字列を数値に変換
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_date">目標達成期日</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => handleInputChange('target_date', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_level">活動レベル</Label>
                <Select onValueChange={(value) => handleInputChange('activity_level', value)} value={formData.activity_level}>
                  <SelectTrigger>
                    <SelectValue placeholder="活動レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">座り仕事が多い</SelectItem>
                    <SelectItem value="light">軽い運動をする</SelectItem>
                    <SelectItem value="moderate">中程度の運動をする</SelectItem>
                    <SelectItem value="active">活発に運動する</SelectItem>
                    <SelectItem value="very_active">非常に活発に運動する</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
                {nutritionPlan ? '栄養プランを更新' : '栄養プランを作成'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} className="w-full">ダッシュボードに戻る</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
