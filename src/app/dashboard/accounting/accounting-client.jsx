'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Calendar, Wallet, 
  TrendingUp, TrendingDown, 
  BarChart3,
  PieChart, Scale, Check, Landmark
} from 'lucide-react';
import {
  addAccountingEntryAction,
  deleteAccountingEntryAction,
  addAccountingDebtAction,
  toggleAccountingDebtPaidAction,
  deleteAccountingDebtAction,
  addAccountingCreditAction,
  payAccountingCreditAction,
  deleteAccountingCreditAction,
} from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

const MONTH_NAMES_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function startOfDay(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

function addMonths(d, n) {
  const day = d.getDate();
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(day, last));
  return startOfDay(t);
}

function daysBetweenDates(from, to) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000);
}

/** Kasa defteri: MANUAL + tekrarlayanların cutoff gününe kadar tüm tarihli oluşumları. */
function expandLedgerEventsUpTo(entries, cutoffEnd) {
  const cutoff = startOfDay(cutoffEnd);
  const out = [];

  entries.forEach((entry) => {
    const anchor = startOfDay(new Date(entry.date));
    const { amount, type, description, id, frequency } = entry;

    if (frequency === 'MANUAL') {
      if (anchor <= cutoff) {
        out.push({
          sortTime: anchor.getTime(),
          date: anchor,
          type,
          amount,
          description,
          sourceId: id,
          frequency: 'MANUAL',
          isVirtual: false,
        });
      }
      return;
    }

    if (frequency === 'MONTHLY') {
      let n = 0;
      while (true) {
        const occ = addMonths(anchor, n);
        if (occ > cutoff) break;
        out.push({
          sortTime: occ.getTime(),
          date: occ,
          type,
          amount,
          description: `${description} (Aylık)`,
          sourceId: id,
          frequency: 'MONTHLY',
          isVirtual: true,
        });
        n += 1;
      }
      return;
    }

    if (frequency === 'QUARTERLY') {
      let block = 0;
      while (true) {
        const base = addMonths(anchor, block * 3);
        if (base > cutoff) break;
        for (let j = 0; j < 3; j += 1) {
          const occ = addMonths(base, j);
          if (occ > cutoff) continue;
          out.push({
            sortTime: occ.getTime(),
            date: occ,
            type,
            amount: amount / 3,
            description: `${description} (3 aylık — dönem ${block + 1}, ${j + 1}. ay)`,
            sourceId: id,
            frequency: 'QUARTERLY',
            isVirtual: true,
          });
        }
        block += 1;
      }
      return;
    }

    if (frequency === 'YEARLY') {
      let block = 0;
      while (true) {
        const yearStart = addMonths(anchor, block * 12);
        if (yearStart > cutoff) break;
        for (let m = 0; m < 12; m += 1) {
          const occ = addMonths(yearStart, m);
          if (occ > cutoff) break;
          out.push({
            sortTime: occ.getTime(),
            date: occ,
            type,
            amount: amount / 12,
            description: `${description} (Senelik — yıl ${block + 1}, ay ${m + 1}/12)`,
            sourceId: id,
            frequency: 'YEARLY',
            isVirtual: true,
          });
        }
        block += 1;
      }
    }
  });

  out.sort((a, b) => {
    if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
    if (a.type === b.type) return 0;
    if (a.type === 'INCOME') return -1;
    return 1;
  });

  return out;
}

function isCreditPaidThisMonth(lastPaidAt) {
  if (!lastPaidAt) return false;
  const now = new Date();
  const paid = new Date(lastPaidAt);
  return paid.getFullYear() === now.getFullYear() && paid.getMonth() === now.getMonth();
}

export default function AccountingClient({ initialEntries, initialDebts = [], initialCredits = [], userRole }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  const [loading, setLoading] = useState(false);
  const [debtLoading, setDebtLoading] = useState(false);
  const [creditLoading, setCreditLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState('INCOME'); // INCOME or EXPENSE
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPaidDebts, setShowPaidDebts] = useState(false);

  // Generate helper for months
  const months = MONTH_NAMES_TR;
  const years = [2024, 2025, 2026];

  // Logic to expand recurring entries for a specific month
  const getProcessedEntries = (month, year) => {
    let processed = [];
    initialEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const entryMonth = entryDate.getMonth();
      const entryYear = entryDate.getFullYear();

      // Simple case: MANUAL
      if (entry.frequency === 'MANUAL') {
        if (entryMonth === month && entryYear === year) {
          processed.push({ ...entry, displayAmount: entry.amount });
        }
        return;
      }

      // Recurring cases
      if (entry.frequency === 'MONTHLY') {
        // Starts from entry date, repeats every month
        const targetDate = new Date(year, month, 1);
        const startTarget = new Date(entryYear, entryMonth, 1);
        if (targetDate >= startTarget) {
          processed.push({ ...entry, displayAmount: entry.amount, isRecurring: true });
        }
      } else if (entry.frequency === 'QUARTERLY') {
        // Divided by 3, spans 3 months
        const targetDate = new Date(year, month, 1);
        const startTarget = new Date(entryYear, entryMonth, 1);
        const endTarget = new Date(entryYear, entryMonth + 3, 1);
        if (targetDate >= startTarget && targetDate < endTarget) {
          processed.push({ ...entry, displayAmount: entry.amount / 3, isRecurring: true, note: '(3 Aylık)' });
        }
      } else if (entry.frequency === 'YEARLY') {
        // Divided by 12, spans 12 months
        const targetDate = new Date(year, month, 1);
        const startTarget = new Date(entryYear, entryMonth, 1);
        const endTarget = new Date(entryYear, entryMonth + 12, 1);
        if (targetDate >= startTarget && targetDate < endTarget) {
          processed.push({ ...entry, displayAmount: entry.amount / 12, isRecurring: true, note: '(Senelik)' });
        }
      }
    });
    return processed;
  };

  const currentMonthEntries = useMemo(() => getProcessedEntries(selectedMonth, selectedYear), [initialEntries, selectedMonth, selectedYear]);
  
  const incomes = currentMonthEntries.filter(e => e.type === 'INCOME');
  const expenses = currentMonthEntries.filter(e => e.type === 'EXPENSE');

  const ledgerCutoffDate = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0),
    [selectedYear, selectedMonth]
  );

  const ledgerEntries = useMemo(() => {
    const cutoff = startOfDay(ledgerCutoffDate);
    const expanded = expandLedgerEventsUpTo(initialEntries, cutoff);
    let running = 0;
    return expanded.map((e) => {
      running += e.type === 'INCOME' ? e.amount : -e.amount;
      return { ...e, balance: running };
    });
  }, [initialEntries, selectedMonth, selectedYear, ledgerCutoffDate]);

  const ledgerRowsWithPeriods = useMemo(() => {
    return ledgerEntries.map((e, i) => {
      const next = ledgerEntries[i + 1];
      let daysUntilNext;
      let nextLabel;
      if (next) {
        daysUntilNext = daysBetweenDates(e.date, next.date);
        nextLabel = `${next.date.toLocaleDateString('tr-TR')} · ${next.description.length > 48 ? `${next.description.slice(0, 48)}…` : next.description}`;
      } else {
        daysUntilNext = daysBetweenDates(e.date, ledgerCutoffDate);
        nextLabel = `${MONTH_NAMES_TR[selectedMonth]} sonu (${ledgerCutoffDate.toLocaleDateString('tr-TR')})`;
      }
      return { ...e, daysUntilNext, nextLabel };
    });
  }, [ledgerEntries, ledgerCutoffDate, selectedMonth]);

  const balanceAsOfToday = useMemo(() => {
    const today = startOfDay(new Date());
    const expanded = expandLedgerEventsUpTo(initialEntries, today);
    return expanded.reduce((sum, e) => sum + (e.type === 'INCOME' ? e.amount : -e.amount), 0);
  }, [initialEntries]);

  const totalIncome = incomes.reduce((sum, e) => sum + e.displayAmount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.displayAmount, 0);
  const netProfit = totalIncome - totalExpense;

  const openDebts = useMemo(
    () => initialDebts.filter((d) => !d.isPaid),
    [initialDebts]
  );
  const paidDebts = useMemo(
    () => initialDebts.filter((d) => d.isPaid),
    [initialDebts]
  );
  const totalOpenDebt = useMemo(
    () => openDebts.reduce((sum, d) => sum + (d.amount ?? 0), 0),
    [openDebts]
  );
  const visibleDebts = showPaidDebts ? initialDebts : openDebts;

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (debtLoading) return;
    setDebtLoading(true);
    setGlobalLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addAccountingDebtAction(formData);
    if (result.success) {
      e.currentTarget.reset();
      router.refresh();
    } else {
      alert(result.error);
    }
    setDebtLoading(false);
    setGlobalLoading(false);
  };

  const handleToggleDebtPaid = async (id, isPaid) => {
    if (debtLoading) return;
    setDebtLoading(true);
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('isPaid', isPaid ? 'true' : 'false');
    const result = await toggleAccountingDebtPaidAction(formData);
    if (!result.success) alert(result.error);
    router.refresh();
    setDebtLoading(false);
    setGlobalLoading(false);
  };

  const handleDeleteDebt = async (id) => {
    if (debtLoading) return;
    if (!confirm('Bu borç kaydını silmek istediğinize emin misiniz?')) return;
    setDebtLoading(true);
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    const result = await deleteAccountingDebtAction(formData);
    if (!result.success) alert(result.error);
    router.refresh();
    setDebtLoading(false);
    setGlobalLoading(false);
  };

  const activeCredits = useMemo(
    () => initialCredits.filter((c) => c.remainingAmount > 0),
    [initialCredits]
  );
  const totalRemainingCredit = useMemo(
    () => activeCredits.reduce((sum, c) => sum + c.remainingAmount, 0),
    [activeCredits]
  );
  const totalMonthlyCreditPayment = useMemo(
    () => activeCredits.reduce((sum, c) => sum + c.monthlyPayment, 0),
    [activeCredits]
  );

  const handleAddCredit = async (e) => {
    e.preventDefault();
    if (creditLoading) return;
    setCreditLoading(true);
    setGlobalLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await addAccountingCreditAction(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        e.currentTarget.reset();
        router.refresh();
      }
    } finally {
      setCreditLoading(false);
      setGlobalLoading(false);
    }
  };

  const handlePayCredit = async (id) => {
    if (creditLoading) return;
    setCreditLoading(true);
    setGlobalLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      const result = await payAccountingCreditAction(formData);
      if (result?.error) alert(result.error);
      else router.refresh();
    } finally {
      setCreditLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleDeleteCredit = async (id) => {
    if (creditLoading) return;
    if (!confirm('Bu kredi kaydını silmek istediğinize emin misiniz?')) return;
    setCreditLoading(true);
    setGlobalLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      const result = await deleteAccountingCreditAction(formData);
      if (result?.error) alert(result.error);
      else router.refresh();
    } finally {
      setCreditLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleAddEntry = async (formData) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    const result = await addAccountingEntryAction(formData);
    if (result.success) {
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const handleDeleteEntry = async (id) => {
    if (loading) return;
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    
    setLoading(true);
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    await deleteAccountingEntryAction(formData);
    router.refresh();
    setLoading(false);
    setGlobalLoading(false);
  };

  // Cash Projection for 12 months
  const cashProjection = useMemo(() => {
    let projections = [];
    const now = new Date();
    let runningBalance = 0;
    
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const m = targetDate.getMonth();
      const y = targetDate.getFullYear();
      
      const entries = getProcessedEntries(m, y);
      const inc = entries.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + e.displayAmount, 0);
      const exp = entries.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + e.displayAmount, 0);
      const net = inc - exp;
      runningBalance += net;
      
      projections.push({
        monthName: months[m],
        year: y,
        income: inc,
        expense: exp,
        net: net,
        cumulative: runningBalance
      });
    }
    return projections;
  }, [initialEntries]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      
      {/* Header & Month Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '0.25rem' }}>Muhasebe Yönetimi</h1>
          <p className="text-muted">Gelir ve giderlerinizi takip edin, finansal durumunuzu kontrol altında tutun.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input-field"
            style={{ border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field"
            style={{ border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Net Calculation Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOPLAM GELİR</span>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{totalIncome.toLocaleString('tr-TR')} TL</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOPLAM GİDER</span>
            <TrendingDown size={18} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{totalExpense.toLocaleString('tr-TR')} TL</div>
        </div>

        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          borderLeft: `4px solid ${netProfit >= 0 ? '#3b82f6' : '#f59e0b'}`,
          background: netProfit >= 0 ? 'rgba(59, 130, 246, 0.03)' : 'rgba(245, 158, 11, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>NET DURUM (AYLIK)</span>
            <PieChart size={18} style={{ color: netProfit >= 0 ? '#3b82f6' : '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: netProfit >= 0 ? '#3b82f6' : '#f59e0b' }}>
            {netProfit.toLocaleString('tr-TR')} TL
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {netProfit >= 0 ? 'Bu ay kârdayız! 📈' : 'Bu ay içerideyiz. 📉'}
          </p>
        </div>
      </div>

      {/* Borçlar */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid #a855f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale size={24} style={{ color: '#a855f7' }} />
            <div>
              <h2 className="heading-2" style={{ marginBottom: '0.15rem' }}>Borçlar</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '520px' }}>
                Kredi, tedarikçi, vergi vb. borçlarınızı buraya yazın. Aylık tekrar etmez; sadece borç listesi.
              </p>
            </div>
          </div>
          <div style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid #a855f7',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Açık borç toplamı</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#a855f7' }}>
              {totalOpenDebt.toLocaleString('tr-TR')} TL
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {openDebts.length} açık · {paidDebts.length} ödendi
            </div>
          </div>
        </div>

        <form
          onSubmit={handleAddDebt}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            alignItems: 'end',
            marginBottom: '1.25rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Borç / kime</label>
            <input
              type="text"
              name="description"
              className="input-field"
              placeholder="Örn. X Bankası kredi..."
              required
            />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Tutar (TL)</label>
            <input type="number" step="0.01" min="0" name="amount" className="input-field" placeholder="İsteğe bağlı" />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Not</label>
            <input type="text" name="note" className="input-field" placeholder="Vade, IBAN..." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={debtLoading} style={{ height: '42px', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Ekle
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={showPaidDebts}
              onChange={(e) => setShowPaidDebts(e.target.checked)}
            />
            Ödenenleri de göster
          </label>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {visibleDebts.length > 0 ? (
            visibleDebts.map((debt) => (
              <DebtItem
                key={debt.id}
                debt={debt}
                onTogglePaid={handleToggleDebtPaid}
                onDelete={handleDeleteDebt}
                disabled={debtLoading}
              />
            ))
          ) : (
            <EmptyList message={showPaidDebts ? 'Henüz borç kaydı yok.' : 'Açık borç yok. Yukarıdan ekleyebilirsiniz.'} />
          )}
        </div>
      </div>

      {/* Kredi ödemeleri */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Landmark size={24} style={{ color: '#f59e0b' }} />
            <div>
              <h2 className="heading-2" style={{ marginBottom: '0.15rem' }}>Kredi Ödemeleri</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '520px' }}>
                Banka kredilerinizi takip edin. &quot;Ödendi&quot; dediğinizde aylık tutar otomatik giderlere eklenir.
              </p>
            </div>
          </div>
          <div style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid #f59e0b',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Kalan toplam</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>
              {totalRemainingCredit.toLocaleString('tr-TR')} TL
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Aylık toplam: {totalMonthlyCreditPayment.toLocaleString('tr-TR')} TL
            </div>
          </div>
        </div>

        <form
          onSubmit={handleAddCredit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            alignItems: 'end',
            marginBottom: '1.25rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Banka</label>
            <input type="text" name="bankName" className="input-field" placeholder="Örn. Ziraat Bankası" required />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Toplam kredi (TL)</label>
            <input type="number" step="0.01" min="0.01" name="totalAmount" className="input-field" placeholder="500000" required />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Aylık ödeme (TL)</label>
            <input type="number" step="0.01" min="0.01" name="monthlyPayment" className="input-field" placeholder="15000" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creditLoading} style={{ height: '42px', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Ekle
          </button>
        </form>

        <div className="card" style={{ padding: 0 }}>
          {initialCredits.length > 0 ? (
            initialCredits.map((credit) => (
              <CreditItem
                key={credit.id}
                credit={credit}
                onPay={handlePayCredit}
                onDelete={handleDeleteCredit}
                disabled={creditLoading}
              />
            ))
          ) : (
            <EmptyList message="Henüz kredi kaydı yok. Yukarıdan ekleyebilirsiniz." />
          )}
        </div>
      </div>

      {/* Lists Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Income List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} style={{ color: '#10b981' }} /> Gelirler
            </h2>
            <button 
              onClick={() => { setEntryType('INCOME'); setIsAddModalOpen(true); }}
              className="btn btn-primary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Gelir Ekle
            </button>
          </div>
          
          <div className="card" style={{ padding: 0 }}>
            {incomes.length > 0 ? incomes.map(item => (
              <EntryItem key={`${item.id}-${item.isRecurring}`} item={item} onDelete={handleDeleteEntry} color="#10b981" />
            )) : <EmptyList message="Bu ay için gelir kaydı yok." />}
          </div>
        </div>

        {/* Expense List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={24} style={{ color: '#ef4444' }} /> Giderler
            </h2>
            <button 
              onClick={() => { setEntryType('EXPENSE'); setIsAddModalOpen(true); }}
              className="btn btn-primary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#ef4444' }}
            >
              <Plus size={16} /> Gider Ekle
            </button>
          </div>
          
          <div className="card" style={{ padding: 0 }}>
            {expenses.length > 0 ? expenses.map(item => (
              <EntryItem key={`${item.id}-${item.isRecurring}`} item={item} onDelete={handleDeleteEntry} color="#ef4444" />
            )) : <EmptyList message="Bu ay için gider kaydı yok." />}
          </div>
        </div>
      </div>

      {/* Kasa Defteri — running ledger */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wallet size={24} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 className="heading-2" style={{ marginBottom: '0.1rem' }}>Kasa Defteri</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                {months[selectedMonth]} {selectedYear} sonuna kadar tüm hareketler (tek seferlik + aylık / 3 aylık / senelik tekrarlar), tarih sırasıyla.
                Sonraki sütunlar: işlem sonrası kasada ne kadar olduğunuz ve bir sonraki harekete kadar kaç gün bu bakiye geçerli sayılır.
              </p>
            </div>
          </div>
          <div style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: balanceAsOfToday >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${balanceAsOfToday >= 0 ? '#10b981' : '#ef4444'}`,
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bugünkü Kasa</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: balanceAsOfToday >= 0 ? '#10b981' : '#ef4444' }}>
              {balanceAsOfToday.toLocaleString('tr-TR')} TL
            </div>
          </div>
        </div>

        {ledgerRowsWithPeriods.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {months[selectedMonth]} {selectedYear} sonuna kadar kasa hareketi yok.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Tarih</th>
                  <th style={{ padding: '0.75rem 0.6rem', minWidth: '140px' }}>Açıklama</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Giriş</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Çıkış</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Kasa (işlem sonrası)</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Süre (gün)</th>
                  <th style={{ padding: '0.75rem 0.6rem', minWidth: '180px' }}>Sonraki hareket / dönem sonu</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRowsWithPeriods.map((e) => {
                  const isToday = startOfDay(e.date).getTime() === startOfDay(new Date()).getTime();
                  const rowKey = `ledger-${e.sourceId}-${e.sortTime}-${e.type}`;
                  return (
                    <tr key={rowKey} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isToday ? 'rgba(99,102,241,0.06)' : 'transparent',
                    }}>
                      <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.8rem', fontWeight: isToday ? 700 : 400, verticalAlign: 'top' }}>
                        {e.date.toLocaleDateString('tr-TR')}
                        {isToday && <span style={{ marginLeft: '0.35rem', fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 800 }}>BUGÜN</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.8rem', verticalAlign: 'top' }}>
                        {e.description}
                        {e.isVirtual && (
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            Tekrarlayan kayıt (silme tüm seriyi kaldırır)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', color: '#10b981', fontWeight: 700, fontSize: '0.8rem', verticalAlign: 'top' }}>
                        {e.type === 'INCOME' ? `+${e.amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TL` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', verticalAlign: 'top' }}>
                        {e.type === 'EXPENSE' ? `-${e.amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TL` : '—'}
                      </td>
                      <td style={{
                        padding: '0.75rem 0.6rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: e.balance >= 0 ? '#10b981' : '#ef4444',
                        verticalAlign: 'top',
                      }}>
                        {e.balance.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TL
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'top' }}>
                        {e.daysUntilNext}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35, verticalAlign: 'top' }}>
                        {e.nextLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cash Projection (Kasa Önizlemesi) */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <BarChart3 size={24} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 className="heading-2" style={{ marginBottom: '0.1rem' }}>Kasa Önizlemesi</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Mevcut düzenli gelir ve giderlerinize göre 12 aylık projeksiyon.</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>AY / YIL</th>
                <th style={{ padding: '1rem' }}>TAHMİNİ GELİR</th>
                <th style={{ padding: '1rem' }}>TAHMİNİ GİDER</th>
                <th style={{ padding: '1rem' }}>AYLIK NET</th>
                <th style={{ padding: '1rem' }}>KASA TOPLAMI</th>
                <th style={{ padding: '1rem' }}>GİDİŞAT</th>
              </tr>
            </thead>
            <tbody>
              {cashProjection.map((proj, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{proj.monthName} {proj.year}</td>
                  <td style={{ padding: '1rem', color: '#10b981' }}>+{proj.income.toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '1rem', color: '#ef4444' }}>-{proj.expense.toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: proj.net >= 0 ? '#3b82f6' : '#f59e0b' }}>
                    {proj.net >= 0 ? '+' : ''}{proj.net.toLocaleString('tr-TR')} TL
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, fontSize: '1.1rem', color: proj.cumulative >= 0 ? '#10b981' : '#ef4444', background: 'rgba(255,255,255,0.02)' }}>
                    {proj.cumulative.toLocaleString('tr-TR')} TL
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: `${Math.min(100, Math.max(10, (proj.income / (proj.income + proj.expense || 1)) * 100))}%`, 
                        height: '100%', 
                        background: proj.net >= 0 ? 'var(--accent-gradient)' : '#f59e0b' 
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      <CustomDialog
        isOpen={isAddModalOpen}
        title={`${entryType === 'INCOME' ? 'Gelir' : 'Gider'} Ekle`}
        onClose={() => setIsAddModalOpen(false)}
        showButtons={false}
      >
        <form action={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="type" value={entryType} />
          
          <div className="input-group">
            <label className="input-label">Açıklama</label>
            <input type="text" name="description" className="input-field" placeholder="Kayıt açıklaması..." required />
          </div>

          <div className="input-group">
            <label className="input-label">Tutar (TL)</label>
            <input type="number" step="0.01" name="amount" className="input-field" placeholder="0,00" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Tarih</label>
              <input type="date" name="date" className="input-field" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="input-group">
              <label className="input-label">Periyot</label>
              <select name="frequency" className="input-field">
                <option value="MANUAL">Tek Seferlik (Manuel)</option>
                <option value="MONTHLY">Aylık</option>
                <option value="QUARTERLY">3 Aylık</option>
                <option value="YEARLY">Senelik</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>İptal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: entryType === 'EXPENSE' ? '#ef4444' : 'var(--accent-primary)' }} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </CustomDialog>

    </div>
  );
}

function EntryItem({ item, onDelete, color }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem', 
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      transition: 'background 0.2s',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.description}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={10} /> {new Date(item.date).toLocaleDateString('tr-TR')}
          {item.isRecurring && <span style={{ color, fontWeight: 700, marginLeft: '0.5rem' }}>• {item.frequency === 'MONTHLY' ? 'Aylık' : (item.frequency === 'QUARTERLY' ? '3 Aylık' : 'Senelik')}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, color, fontSize: '1rem' }}>
            {item.type === 'INCOME' ? '+' : '-'}{item.displayAmount.toLocaleString('tr-TR')} TL
          </div>
          {item.note && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.note}</div>}
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '0.25rem' }}
          onMouseEnter={(e) => e.target.style.color = '#ef4444'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function CreditItem({ credit, onPay, onDelete, disabled }) {
  const fullyPaid = credit.remainingAmount <= 0;
  const paidThisMonth = isCreditPaidThisMonth(credit.lastPaidAt);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem 1.1rem',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        opacity: fullyPaid ? 0.55 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{credit.bankName}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Toplam: {credit.totalAmount.toLocaleString('tr-TR')} TL · Kalan: {credit.remainingAmount.toLocaleString('tr-TR')} TL
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
          Aylık ödeme: {credit.monthlyPayment.toLocaleString('tr-TR')} TL
        </div>
        {fullyPaid && (
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>
            Tamamen ödendi
          </span>
        )}
        {!fullyPaid && paidThisMonth && (
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>
            Bu ay ödendi
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {!fullyPaid && (
          <button
            type="button"
            disabled={disabled || paidThisMonth}
            onClick={() => onPay(credit.id)}
            className="btn btn-primary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              opacity: paidThisMonth ? 0.5 : 1,
            }}
          >
            <Check size={14} /> {paidThisMonth ? 'Bu ay ödendi' : 'Ödendi'}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(credit.id)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: disabled ? 'wait' : 'pointer', padding: '0.25rem' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function DebtItem({ debt, onTogglePaid, onDelete, disabled }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem 1.1rem',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        opacity: debt.isPaid ? 0.55 : 1,
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTogglePaid(debt.id, !debt.isPaid)}
        title={debt.isPaid ? 'Tekrar açık işaretle' : 'Ödendi işaretle'}
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '8px',
          border: `2px solid ${debt.isPaid ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
          background: debt.isPaid ? 'rgba(16,185,129,0.2)' : 'transparent',
          color: debt.isPaid ? '#10b981' : 'var(--text-secondary)',
          cursor: disabled ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '0.15rem',
        }}
      >
        {debt.isPaid && <Check size={14} strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: debt.isPaid ? 'line-through' : 'none',
          }}
        >
          {debt.description}
        </div>
        {debt.note && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {debt.note}
          </div>
        )}
        {debt.isPaid && (
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, marginTop: '0.2rem', display: 'inline-block' }}>
            Ödendi
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {debt.amount != null && (
          <div
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              color: '#a855f7',
              textDecoration: debt.isPaid ? 'line-through' : 'none',
            }}
          >
            {debt.amount.toLocaleString('tr-TR')} TL
          </div>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(debt.id)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: disabled ? 'wait' : 'pointer', padding: '0.25rem' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyList({ message }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p style={{ fontSize: '0.85rem' }}>{message}</p>
    </div>
  );
}
