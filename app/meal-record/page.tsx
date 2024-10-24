'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { supabase } from '@/utils/supabase/supabase'

export default function MealRecordPage() {
  const router = useRouter()
  const [meals, setMeals] = useState({
    breakfast: { food: '', calories: '' },
    lunch: { food: '', calories: '' },
    dinner: { food: '', calories: '' },
    snack: { food: '', calories: '' },
  })
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (meal: string, field: string, value: string) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [meal]: { ...prevMeals[meal], [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const mealRecords = Object.entries(meals).map(([meal_type, { food, calories }]) => ({
      user_id: user.id,
      meal_type,
      food,
      calories: parseInt(calories)
    }))

    const { data, error } = await supabase
      .from('meal_records')
      .insert(mealRecords)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Card className="w-full max-w-2xl mt-10">
        <CardHeader>
          <CardTitle>食事記録</CardTitle>
          <CardDescription>今日の食事を記録してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="breakfast" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="breakfast">朝食</TabsTrigger>
                <TabsTrigger value="lunch">昼食</TabsTrigger>
                <TabsTrigger value="dinner">夕食</TabsTrigger>
                <TabsTrigger value="snack">間食</TabsTrigger>
              </TabsList>
              {Object.entries(meals).map(([meal, data]) => (
                <TabsContent key={meal} value={meal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${meal}-food`}>食品名</Label>
                    <Input
                      id={`${meal}-food`}
                      value={data.food}
                      onChange={(e) => handleInputChange(meal, 'food', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${meal}-calories`}>カロリー (kcal)</Label>
                    <Input
                      id={`${meal}-calories`}
                      type="number"
                      value={data.calories}
                      onChange={(e) => handleInputChange(meal, 'calories', e.target.value)}
                      required
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <Button type="submit" className="w-full mt-6">記録する</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/dashboard')} className="w-full">ダッシュボードに戻る</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
