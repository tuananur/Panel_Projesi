'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Plus, Trash2, Users, Calendar } from 'lucide-react';
import { addMealOrderAction, deleteMealOrderAction } from '@/app/actions';

function localDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateTr(iso) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MealsClient({ initialOrders = [] }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => localDateInputValue());

  const todayValue = useMemo(() => localDateInputValue(new Date()), []);
  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return formatDateTr(new Date(y, m - 1, d));
  }, [selectedDate]);

  const totalCost = useMemo(
    () => initialOrders.reduce((sum, o) => sum + o.cost, 0),
    [initialOrders]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const form = formRef.current;
    const formData = new FormData(form);

    try {
      const result = await addMealOrderAction(formData);
      if (result?.error) {
        alert(result.error);
        return;
      }
      form?.reset();
      const dateInput = form?.querySelector('[name="date"]');
      if (dateInput) dateInput.value = selectedDate;
      const select = form?.querySelector('[name="personCount"]');
      if (select) select.value = '1';
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (loading) return;
    if (!confirm('Bu yemek kaydını silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      const result = await deleteMealOrderAction(formData);
      if (result?.error) alert(result.error);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div>
        <h1 className="heading-1" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UtensilsCrossed size={28} style={{ color: 'var(--accent-primary)' }} />
          Yemek
        </h1>
        <p className="text-muted">Günlük yemek siparişlerini kaydedin. Geçmiş tarih için de giriş yapabilirsiniz; tutar otomatik giderlere eklenir.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--accent-primary)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          {selectedDateLabel}
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}
        >
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} /> Tarih
            </label>
            <input
              type="date"
              name="date"
              className="input-field"
              value={selectedDate}
              max={todayValue}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={14} /> Kişi sayısı
            </label>
            <select name="personCount" className="input-field" defaultValue="1" required>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} kişi
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Yemek ücreti (TL)</label>
            <input
              type="number"
              name="cost"
              className="input-field"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            <Plus size={16} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 className="heading-2" style={{ margin: 0 }}>Kayıtlar</h2>
          <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Toplam ücret: {totalCost.toLocaleString('tr-TR')} TL
          </span>
        </div>

        {initialOrders.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
            Henüz kayıt yok.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Tarih</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Kişi sayısı</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Ücret</th>
                  <th style={{ padding: '0.75rem 0.6rem', width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {initialOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 0.6rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      {new Date(order.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', fontSize: '0.9rem' }}>
                      {order.personCount} kişi
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {order.cost.toLocaleString('tr-TR')} TL
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleDelete(order.id)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: loading ? 'wait' : 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
