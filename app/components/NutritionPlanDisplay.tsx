import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface NutritionPlan {
  id: number
  breakfast: string
  lunch: string
  dinner: string
  snack: string
  created_at: string
}

interface NutritionPlanDisplayProps {
  plan: NutritionPlan
}

export default function NutritionPlanDisplay({ plan }: NutritionPlanDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Breakfast:</strong> {plan.breakfast}</p>
        <p><strong>Lunch:</strong> {plan.lunch}</p>
        <p><strong>Dinner:</strong> {plan.dinner}</p>
        <p><strong>Snack:</strong> {plan.snack}</p>
        <p className="text-sm text-gray-500 mt-2">
          Created on: {new Date(plan.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}