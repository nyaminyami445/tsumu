import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

function App() {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');

  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').toArray(), []);

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

      <ul>
        {goals?.map((goal) => (
          <li key={goal.id}>
            {goal.name}：{goal.targetAmount.toLocaleString()}円
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;