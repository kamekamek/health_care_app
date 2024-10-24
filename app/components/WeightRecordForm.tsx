import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface WeightRecordFormProps {
  onSubmit: (weight: number) => void
}

export default function WeightRecordForm({ onSubmit }: WeightRecordFormProps) {
  const [weight, setWeight] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(parseFloat(weight))
    setWeight('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="weight">現在の体重 (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </div>
      <Button type="submit">進捗を記録</Button>
    </form>
  )
}
