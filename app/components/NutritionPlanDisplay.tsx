import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { NutritionPlan } from "../lib/types"

interface NutritionPlanDisplayProps {
  plan: NutritionPlan
}

export default function NutritionPlanDisplay({ plan }: NutritionPlanDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1日の推奨カロリー: {plan.dailyCalories} kcal</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">食事プラン:</h3>
        <ul className="space-y-2">
          {Object.entries(plan.mealPlan).map(([meal, description]) => (
            <li key={meal}>
              <span className="font-medium">{meal}:</span> {description}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}