import { db } from './db';

const TYPE_LABELS = {
  skipped: '使わなかった',
  discount: '安く済ませた',
};

export default function RecordHistory({ goals, records }) {
  const goalNames = {};
  for (const goal of goals) {
    goalNames[goal.id] = goal.name;
  }

  const sorted = [...records].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

  async function handleDelete(record) {
    const ok = window.confirm(
      `${record.date}の${record.amount.toLocaleString()}円の記録を削除しますか？`
    );
    if (!ok) return;

    try {
      await db.records.delete(record.id);
    } catch (err) {
      console.error(err);
      window.alert('削除に失敗しました');
    }
  }

  if (sorted.length === 0) {
    return <p>まだ記録がありません</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
      {sorted.map((record) => (
        <li
          key={record.id}
          style={{ borderBottom: '1px solid #dddddd', padding: '8px 0' }}
        >
          <div>
            {record.date}　{goalNames[record.goalId] ?? '（不明な目標）'}
          </div>
          <div>
            <strong>{record.amount.toLocaleString()}円</strong>
            　{TYPE_LABELS[record.type]}
            {record.type === 'discount' && (
              <span style={{ fontSize: 14 }}>
                （予定 {record.plannedAmount.toLocaleString()}円 → 実際{' '}
                {record.actualAmount.toLocaleString()}円）
              </span>
            )}
          </div>
          {record.memo && <div style={{ fontSize: 14 }}>{record.memo}</div>}
          <button type="button" onClick={() => handleDelete(record)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}