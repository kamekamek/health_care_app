import { SetStateAction, useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

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
        <Label htmlFor="weight">体重 (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          required
          value={weight}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setWeight(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit">記録</Button>
    </form>
  )
}