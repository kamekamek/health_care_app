import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/supabase';

const MealRecordList = ({ userId }) => {
    const [mealRecords, setMealRecords] = useState([]);

    useEffect(() => {
        const fetchMealRecords = async () => {
            const { data, error } = await supabase
                .from('meal_records')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (data) {
                setMealRecords(data);
            }
        };

        fetchMealRecords();
    }, [userId]);

    return (
        <div>
            <h2>過去の食事記録</h2>
            <ul>
                {mealRecords.map((record) => (
                    <li key={record.id}>
                        {record.breakfast}, {record.lunch}, {record.dinner}, {record.snack}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MealRecordList;
