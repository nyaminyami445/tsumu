import { useState } from 'react';
import { db } from './db';

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toInt(value) {
  const n = Number(value);
  return value !== '' && Number.isInteger(n) ? n : null;
}

export default function RecordForm({ goals }) {
  const [type, setType] = useState('skipped');
  const [amount, setAmount] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [goalId, setGoalId] = useState('');
  const [date, setDate] = useState(getToday());
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    let saved;
    let planned = null;
    let actual = null;

    if (type === 'skipped') {
      saved = toInt(amount);
    } else {
      planned = toInt(plannedAmount);
      actual = toInt(actualAmount);
      if (planned === null || actual === null || actual < 0) {
        setError('予定額と実際の額を0円以上の整数で入力してください');
        return;
      }
      if (planned <= actual) {
        setError('実際の額は予定額より安くしてください');
        return;
      }
      saved = planned - actual;
    }

    if (saved === null || saved < 1 || saved > 10000000) {
      setError('節約額は1円〜1,000万円の整数で入力してください');
      return;
    }
    if (!goalId) {
      setError('反映先の目標を選んでください');
      return;
    }
    if (!date || date > getToday()) {
      setError('日付は今日以前を選んでください');
      return;
    }
    if (memo.length > 200) {
      setError('メモは200文字以内で入力してください');
      return;
    }

    try {
      const now = new Date().toISOString();
      await db.records.add({
        id: crypto.randomUUID(),
        goalId,
        type,
        amount: saved,
        plannedAmount: planned,
        actualAmount: actual,
        date,
        memo: memo.trim(),
        createdAt: now,
        updatedAt: now,
      });
      setAmount('');
      setPlannedAmount('');
      setActualAmount('');
      setMemo('');
      setError('');
      setMessage(`${saved.toLocaleString()}円を記録しました`);
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    }
  }

  if (goals.length === 0) {
    return <p>先に目標を登録してください</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="radio"
            checked={type === 'skipped'}
            onChange={() => setType('skipped')}
          />
          使わなかった
        </label>
        <label>
          <input
            type="radio"
            checked={type === 'discount'}
            onChange={() => setType('discount')}
          />
          安く済ませた
        </label>
      </div>

      {type === 'skipped' ? (
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="使わなかった金額"
        />
      ) : (
        <div>
          <input
            type="number"
            value={plannedAmount}
            onChange={(e) => setPlannedAmount(e.target.value)}
            placeholder="予定額"
          />
          <input
            type="number"
            value={actualAmount}
            onChange={(e) => setActualAmount(e.target.value)}
            placeholder="実際の額"
          />
        </div>
      )}

      <div>
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">反映先の目標を選ぶ</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          max={getToday()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={200}
          placeholder="メモ（任意）"
        />
      </div>

      <button type="submit">記録する</button>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
    </form>
  );
}