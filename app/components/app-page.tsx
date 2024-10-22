'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Progress } from "../components/ui/progress"
import { Slider } from "../components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { ScrollArea } from "../components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Info, TrendingUp, TrendingDown, Utensils, Activity } from 'lucide-react'

// Server action (simulated for this example)
async function calculateNutritionPlan(data: any) {
  // ... (previous calculation logic remains unchanged)
}

export function Page() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [progressData, setProgressData] = useState([])
  const [currentWeight, setCurrentWeight] = useState(null)

  useEffect(() => {
    const storedResult = localStorage.getItem('nutritionPlanResult')
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    }
    const storedProgressData = localStorage.getItem('progressData')
    if (storedProgressData) {
      setProgressData(JSON.parse(storedProgressData))
    }
  }, [])

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.target)
    const data = {
      age: Number(formData.get('age')),
      gender: formData.get('gender'),
      height: Number(formData.get('height')),
      weight: Number(formData.get('weight')),
      goalWeight: Number(formData.get('goalWeight')),
      activityLevel: formData.get('activityLevel'),
      targetDate: formData.get('targetDate')
    }
    const calculationResult = await calculateNutritionPlan(data)
    setResult(calculationResult)
    setCurrentWeight(data.weight)
    localStorage.setItem('nutritionPlanResult', JSON.stringify(calculationResult))
    setIsLoading(false)
    setIsDialogOpen(true)
  }

  const handleProgressUpdate = (event: any) => {
    event.preventDefault()
    const weight = Number(event.target.weight.value)
    const date = new Date().toISOString().split('T')[0]
    const newProgressData = [...progressData, { date, weight }]
    setProgressData(newProgressData)
    setCurrentWeight(weight)
    localStorage.setItem('progressData', JSON.stringify(newProgressData))
  }

  const calculateProgress = () => {
    if (!result || !currentWeight) return 0
    const totalWeightChange = Math.abs(result.goalWeight - result.initialWeight)
    const currentWeightChange = Math.abs(currentWeight - result.initialWeight)
    return (currentWeightChange / totalWeightChange) * 100
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">パーソナル栄養プランナー</CardTitle>
          <CardDescription className="text-center text-gray-600">
            あなたの目標に合わせた、理想的な栄養プランを提案します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plan" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plan">栄養プラン作成</TabsTrigger>
              <TabsTrigger value="progress">進捗ダッシュボード</TabsTrigger>
            </TabsList>
            <TabsContent value="plan">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="age">年齢</Label>
                  <Input type="number" id="age" name="age" required className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性別</Label>
                  <Select name="gender" required>
                    <SelectTrigger className="border-gray-300">
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
                  <Input type="number" id="height" name="height" required className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">現在の体重 (kg)</Label>
                  <Input type="number" id="weight" name="weight" required className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalWeight">目標体重 (kg)</Label>
                  <Input type="number" id="goalWeight" name="goalWeight" required className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">目標達成期日</Label>
                  <Input type="date" id="targetDate" name="targetDate" required className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">活動レベル</Label>
                  <Select name="activityLevel" required>
                    <SelectTrigger className="border-gray-300">
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
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? "計算中..." : "栄養プランを作成"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="progress">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">目標達成度</h3>
                    <div className="flex items-center space-x-2">
                      <Progress value={calculateProgress()} className="w-full" />
                      <span className="text-sm font-medium">{calculateProgress().toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      現在の体重: {currentWeight}kg / 目標体重: {result.goalWeight}kg
                    </p>
                  </div>
                  <form onSubmit={handleProgressUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="progressWeight">現在の体重 (kg)</Label>
                      <Input type="number" id="progressWeight" name="weight" required className="border-gray-300" />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      進捗を記録
                    </Button>
                  </form>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">体重推移</h3>
                    <Card className="p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <p className="text-center text-gray-600">まずは栄養プランを作成してください。</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isDialogOpen && result && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">あなたの栄養プラン</DialogTitle>
                <DialogDescription className="text-gray-600">
                  目標達成のための推奨カロリーと食事プランです。
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] rounded-md border p-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-purple-600">1日の推奨カロリー:</p>
                    <Badge variant="outline" className="text-lg">
                      {result.recommendedDailyCalories} kcal
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">食事ごとのカロリー配分:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(result.mealDistribution).map(([meal, calories]) => (
                        <Card key={meal} className="p-4">
                          <CardHeader className="p-0">
                            <CardTitle className="text-base">{meal}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 pt-2">
                            <p className="text-2xl font-bold">{calories} kcal</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">おすすめの食事プラン:</h3>
                    <div className="space-y-4">
                      {Object.entries(result.recommendations).map(([meal, recommendation]) => (
                        <div key={meal} className="flex items-start space-x-2">
                          <Utensils className="w-5 h-5 mt-1 text-purple-500" />
                          <div>
                            <p className="font-medium">{meal}:</p>
                            <p className="text-gray-600">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">予想体重推移:</h3>
                    <Card className="p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={result.weightProgressionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="day" 
                            label={{ value: '日数', position: 'insideBottom', offset: -5 }}
                            ticks={[0, result.weightProgressionData[result.weightProgressionData.length - 1].day]}
                          />
                          <YAxis 
                            label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }} 
                            domain={['dataMin - 1', 'dataMax + 1']}
                          />
                          <RechartsTooltip 
                            formatter={(value, name, props) => [`${value} kg`, `${props.payload.date}`]}
                            labelFormatter={(value) => `${value}日目`}
                          />
                          <Legend />
                          <Line  type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </motion.div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </main>
  )
}