import { MealRecord } from '@/app/lib/types'

interface MealRecordListProps {
  mealRecords: MealRecord[]; // ここでMealRecord型の配列を期待
}

export default function MealRecordList({ mealRecords }: MealRecordListProps) {
  return (
    <div>
      {mealRecords.map(record => (
        <div key={record.id}>
          {/* 食事記録の表示 */}
        </div>
      ))}
    </div>
  )
}
