import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface CalorieSuggestionProps {
  dailyCalories: number
}

export default function CalorieSuggestion({ dailyCalories }: CalorieSuggestionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Calorie Suggestion</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{dailyCalories} kcal</p>
        <p className="text-sm text-gray-500">Recommended daily intake</p>
      </CardContent>
    </Card>
  )
}