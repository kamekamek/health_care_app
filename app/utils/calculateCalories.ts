export const calculateCalories = (currentWeight: number, targetWeight: number) => {
    const weightDifference = currentWeight - targetWeight;
    const dailyCaloricDeficit = 500; // 1日500カロリーの減少を目指す
    const suggestedCalories = 2000 - (weightDifference * dailyCaloricDeficit / 7); // 基本的なカロリー計算
    return suggestedCalories;
};
