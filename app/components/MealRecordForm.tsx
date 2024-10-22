import { useState } from 'react';
import { supabase } from '../../utils/supabase/supabase';

const MealRecordForm = ({ userId }) => {
    const [breakfast, setBreakfast] = useState('');
    const [lunch, setLunch] = useState('');
    const [dinner, setDinner] = useState('');
    const [snack, setSnack] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('meal_records')
            .insert([{ user_id: userId, breakfast, lunch, dinner, snack }]);

        if (error) {
            console.error('Error inserting meal record:', error);
        } else {
            // フォームをリセット
            setBreakfast('');
            setLunch('');
            setDinner('');
            setSnack('');
            // Supabaseに食事プランを保存
            await supabase.from('meal_plans').insert([{ user_id: userId, breakfast, lunch, dinner, snack }]);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="朝食" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} />
            <input type="text" placeholder="昼食" value={lunch} onChange={(e) => setLunch(e.target.value)} />
            <input type="text" placeholder="夕食" value={dinner} onChange={(e) => setDinner(e.target.value)} />
            <input type="text" placeholder="間食" value={snack} onChange={(e) => setSnack(e.target.value)} />
            <button type="submit">記録する</button>
        </form>
    );
};

export default MealRecordForm;
