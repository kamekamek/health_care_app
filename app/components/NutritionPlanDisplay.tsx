import { NutritionPlan } from '@/app/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface NutritionPlanDisplayProps {
  plan: NutritionPlan
}

export default function NutritionPlanDisplay({ plan }: NutritionPlanDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>栄養プラン</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>性別:</strong> {plan.gender === 'male' ? '男性' : '女性'}</p>
        <p><strong>年齢:</strong> {plan.age}歳</p>
        <p><strong>身長:</strong> {plan.height}cm</p>
        <p><strong>現在の体重:</strong> {plan.current_weight}kg</p>
        <p><strong>目標体重:</strong> {plan.target_weight}kg</p>
        <p><strong>目標達成日:</strong> {new Date(plan.target_date).toLocaleDateString()}</p>
        <p><strong>活動レベル:</strong> {plan.activity_level}</p>
        <p><strong>1日の目標カロリー:</strong> {plan.daily_calories} kcal</p>
        <p className="text-sm text-gray-500 mt-2">
          作成日: {new Date(plan.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
