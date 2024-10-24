'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '@/utils/supabase/supabase'

export default function NutritionPlanPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    current_weight: '',
    target_weight: '',
    target_date: '',
    activity_level: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState(null)

  useEffect(() => {
    fetchNutritionPlan()
  }, [])

  const fetchNutritionPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching nutrition plan:', error)
    } else {
      setNutritionPlan(data)
      setFormData(data) // フォームにデータをセット
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [field]: value }))
  }

  const calculateDailyCalories = () => {
    const bmr = 10 * parseFloat(formData.current_weight) + 6.25 * parseFloat(formData.height) - 5 * parseInt(formData.age) + (formData.gender === 'male' ? 5 : -161)
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

    const { data, error } = await supabase
      .from('nutrition_plans')
      .insert([{ user_id: user.id, ...formData, daily_calories }]) // daily_caloriesを追加

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

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">ログアウト</Button>
      <div className="flex space-x-10"> {/* フォームと表示を横に並べる */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>栄養プラン作成</CardTitle>
            <CardDescription>あなたの情報を入力して、最適な栄養プランを作成しましょう</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">年齢</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)} required>
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
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_weight">現在の体重 (kg)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  step="0.1"
                  value={formData.current_weight}
                  onChange={(e) => handleInputChange('current_weight', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_weight">目標体重 (kg)</Label>
                <Input
                  id="target_weight"
                  type="number"
                  step="0.1"
                  value={formData.target_weight}
                  onChange={(e) => handleInputChange('target_weight', e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="activity_level">活動レベル</Label>
                <Select onValueChange={(value) => handleInputChange('activity_level', value)} required>
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
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full">栄養プランを作成</Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} className="w-full">ダッシュボードに戻る</Button>
          </CardFooter>
        </Card>
        {nutritionPlan && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>登録した栄養プラン</CardTitle>
            </CardHeader>
            <CardContent>
              <p>年齢: {nutritionPlan.age}</p>
              <p>性別: {nutritionPlan.gender}</p>
              <p>身長: {nutritionPlan.height} cm</p>
              <p>現在の体重: {nutritionPlan.current_weight} kg</p>
              <p>目標体重: {nutritionPlan.target_weight} kg</p>
              <p>目標達成期日: {nutritionPlan.target_date}</p>
              <p>活動レベル: {nutritionPlan.activity_level}</p>
              <p>1日あたりの摂取カロリー: {nutritionPlan.daily_calories} kcal</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
