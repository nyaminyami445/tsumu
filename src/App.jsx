import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import RecordForm from './RecordForm';

function App() {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');

  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').toArray(), []);
  const records = useLiveQuery(() => db.records.toArray(), []);

  const totals = {};
  for (const record of records ?? []) {
    totals[record.goalId] = (totals[record.goalId] ?? 0) + record.amount;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(targetAmount);

    if (!name.trim()) {
      setError('目標名を入力してください');
      return;
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      setError('金額は1円〜1,000万円の整数で入力してください');
      return;
    }

    try {
      const now = new Date().toISOString();
      await db.goals.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        targetAmount: amount,
        imageId: null,
        createdAt: now,
        updatedAt: now,
      });
      setName('');
      setTargetAmount('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    }
  }

  return (
    <main>
      <h1>Tsumu</h1>

      <section>
        <h2>目標を追加</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="目標名"
          />
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="目標金額"
          />
          <button type="submit">追加</button>
        </form>
        {error && <p>{error}</p>}
      </section>

      <section>
        <h2>節約を記録</h2>
        <RecordForm goals={goals ?? []} />
      </section>

      <section>
        <h2>目標一覧</h2>
        <ul>
          {goals?.map((goal) => {
            const saved = totals[goal.id] ?? 0;
            const rate = Math.min(100, Math.floor((saved / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - saved);

            return (
              <li key={goal.id}>
                <strong>{goal.name}</strong>
                {saved >= goal.targetAmount && <span>　達成！</span>}
                <div>
                  <progress value={rate} max={100} /> {rate}%
                </div>
                <div>
                  節約累計 {saved.toLocaleString()}円 ／ 目標{' '}
                  {goal.targetAmount.toLocaleString()}円（残り{' '}
                  {remaining.toLocaleString()}円）
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

export default App;