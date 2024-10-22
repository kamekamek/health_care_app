import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabase'; // パスを修正
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import WeightRecordForm from '../components/WeightRecordForm';

function WeightRecord() {
    const [records, setRecords] = useState([]);
    const userId = 'test_user_id'; // テスト用ユーザーID

    useEffect(() => {
        const fetchRecords = async () => {
            const { data, error } = await supabase
                .from('weight_records')
                .select('*')
                .eq('user_id', userId);
            
            if (data) setRecords(data);
            if (error) console.error(error);
        };

        fetchRecords();

        // 体重を自動で記録する
        const intervalId = setInterval(() => {
            fetchRecords(); // 定期的にデータを取得
        }, 60000); // 1分ごとにデータを取得

        return () => clearInterval(intervalId); // クリーンアップ
    }, []);

    return (
        <div>
            <h1>体重記録</h1>
            <WeightRecordForm userId={userId} onRecordSaved={() => fetchRecords()} />
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
