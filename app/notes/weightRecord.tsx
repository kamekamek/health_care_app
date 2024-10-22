import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function WeightRecord() {
    const [weight, setWeight] = useState('');
    const [records, setRecords] = useState([]);

    const userId = 'test_user_id'; // テスト用ユーザーID

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 体重をSupabaseに保存
        const { data, error } = await supabase
            .from('weight_records')
            .insert([{ user_id: userId, weight: parseFloat(weight), date: new Date() }]);
        
        if (error) console.error(error);
        else setWeight('');
    };

    useEffect(() => {
        // 体重記録を取得
        const fetchRecords = async () => {
            const { data, error } = await supabase
                .from('weight_records')
                .select('*')
                .eq('user_id', userId);
            
            if (data) setRecords(data);
            if (error) console.error(error);
        };

        fetchRecords();
    }, []);

    return (
        <div>
            <h1>体重記録</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="体重を入力"
                    required
                />
                <button type="submit">記録</button>
            </form>
            <LineChart width={600} height={300} data={records}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" />
            </LineChart>
        </div>
    );
}

export default WeightRecord;
