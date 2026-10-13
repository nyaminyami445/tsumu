import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { processImage } from './image';
import RecordForm from './RecordForm';
import GoalImage from './GoalImage';

function App() {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').toArray(), []);
  const records = useLiveQuery(() => db.records.toArray(), []);

  const totals = {};
  for (const record of records ?? []) {
    totals[record.goalId] = (totals[record.goalId] ?? 0) + record.amount;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(targetAmount);
    const file = fileInputRef.current?.files[0];

    if (!name.trim()) {
      setError('目標名を入力してください');
      return;
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      setError('金額は1円〜1,000万円の整数で入力してください');
      return;
    }

    setSaving(true);
    try {
      let image = null;
      if (file) {
        try {
          image = await processImage(file);
        } catch (err) {
          setError(err.message);
          return;
        }
      }

      const now = new Date().toISOString();
      const imageId = image ? crypto.randomUUID() : null;

      await db.transaction('rw', db.goals, db.images, async () => {
        if (image) {
          await db.images.add({ id: imageId, ...image });
        }
        await db.goals.add({
          id: crypto.randomUUID(),
          name: name.trim(),
          targetAmount: amount,
          imageId,
          createdAt: now,
          updatedAt: now,
        });
      });

      setName('');
      setTargetAmount('');
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
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
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
            />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? '保存中…' : '追加'}
          </button>
        </form>
        {error && <p>{error}</p>}
      </section>

      <section>
        <h2>節約を記録</h2>
        <RecordForm goals={goals ?? []} />
      </section>

      <section>
        <h2>目標一覧</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            textAlign: 'left',
          }}
        >
          {goals?.map((goal) => {
            const saved = totals[goal.id] ?? 0;
            const rate = Math.min(100, Math.floor((saved / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - saved);
            const achieved = saved >= goal.targetAmount;

            return (
              <article
                key={goal.id}
                style={{ border: '1px solid #dddddd', borderRadius: 12, padding: 12 }}
              >
                <GoalImage imageId={goal.imageId} rate={rate} achieved={achieved} />
                <h3 style={{ margin: '8px 0 4px' }}>
                  {goal.name}
                  {achieved && '　達成！'}
                </h3>
                <progress value={rate} max={100} style={{ width: '100%' }} />
                <div>
                  {rate}%　残り {remaining.toLocaleString()}円
                </div>
                <div style={{ fontSize: 14 }}>
                  節約累計 {saved.toLocaleString()}円 ／ 目標{' '}
                  {goal.targetAmount.toLocaleString()}円
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;