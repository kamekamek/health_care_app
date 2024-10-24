import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface MealRecordFormProps {
  onSubmit: (mealRecord: { breakfast: string; lunch: string; dinner: string; snack: string }) => void
}

export default function MealRecordForm({ onSubmit }: MealRecordFormProps) {
  const [breakfast, setBreakfast] = useState('')
  const [lunch, setLunch] = useState('')
  const [dinner, setDinner] = useState('')
  const [snack, setSnack] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ breakfast, lunch, dinner, snack })
    setBreakfast('')
    setLunch('')
    setDinner('')
    setSnack('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="breakfast">朝食</Label>
        <Input
          id="breakfast"
          value={breakfast}
          onChange={(e) => setBreakfast(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="lunch">昼食</Label>
        <Input
          id="lunch"
          value={lunch}
          onChange={(e) => setLunch(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="dinner">夕食</Label>
        <Input
          id="dinner"
          value={dinner}
          onChange={(e) => setDinner(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="snack">間食</Label>
        <Input
          id="snack"
          value={snack}
          onChange={(e) => setSnack(e.target.value)}
        />
      </div>
      <Button type="submit">食事を記録</Button>
    </form>
  )
}
