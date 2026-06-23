import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, CheckCircle,
  Clock, Package, BarChart2, AlertTriangle
} from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import { CUSTOMER_BASE, STAFF_BASE } from '../../services/config';

const API_BASE = CUSTOMER_BASE;

const GOLD = '#d4af37';
const GOLD_L = '#f5e199';
function fmt(n) { return Number(n || 0).toLocaleString(); }
function peso(n) { return `₱${fmt(n)}`; }

function StatCard({ title, value, sub, icon: Icon, accent, trend, trendLabel }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[28px] p-7 shadow-lg border border-gray-100 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full
            ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}% {trendLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black mb-1">{title}</p>
        <h2 className="text-4xl font-bold font-serif text-gray-900">{value}</h2>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function BarChart({ data, height = 200, valueKey = 'total', labelKey = 'label', color = GOLD, color2 = GOLD_L, valuePrefix = '₱' }) {
  const W = 800; const H = height; const PAD_T = 16; const PAD_B = 36; const PAD_X = 8;
  const n = data.length || 1;
  const barW = (W - PAD_X * 2) / n;
  const gap = barW * 0.28;
  const bw = barW - gap;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  const plotH = H - PAD_T - PAD_B;
  const gradId = `bg_${color.replace('#','')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} overflow="visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const barH = Math.max(6, (val / max) * plotH);
        const x = PAD_X + i * barW + gap / 2;
        const y = PAD_T + plotH - barH;
        const label = d[labelKey] || '';
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={barH} rx={6} ry={6} fill={`url(#${gradId})`} opacity={val === 0 ? 0.18 : 1} />
            {val === 0 && <rect x={x} y={PAD_T + plotH - 6} width={bw} height={6} rx={3} ry={3} fill={color} opacity={0.18} />}
            <title>{valuePrefix}{fmt(val)}</title>
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="DM Sans, sans-serif" letterSpacing="0.05em">
              {label.length > 6 ? label.slice(0, 5) + '…' : label}
            </text>
          </g>
        );
      })}
      <line x1={PAD_X} y1={PAD_T + plotH} x2={W - PAD_X} y2={PAD_T + plotH} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

function DonutChart({ segments, size = 180 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = size / 2; const cy = size / 2;
  const R = 62; const stroke = 22;
  const circumference = 2 * Math.PI * R;
  let cumulative = 0;
  const arcs = segments.map(seg => {
    const frac = seg.value / total;
    const dash = frac * circumference;
    const offset = circumference * (0.25 - cumulative);
    cumulative += frac;
    return { ...seg, dash, gap: circumference - dash, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af" letterSpacing="2">TOTAL</text>
    </svg>
  );
}

function HorizBar({ label, value, displayValue, max, rank, color = GOLD }) {
  const numericValue = typeof value === 'number' ? value : 0;
  const pct = max > 0 ? (numericValue / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="text-[11px] font-bold text-gray-400 w-5 text-right">{rank}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{label}</span>
          <span className="text-sm font-bold text-gray-900">{displayValue ?? value}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, pct)}%` }}
            transition={{ duration: 0.8, delay: rank * 0.08 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${color}, ${GOLD_L})` }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-2">{eyebrow}</p>
      <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
  );
}

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');

  useEffect(() => {
    Promise.all([
      fetch(`${CUSTOMER_BASE}/api_orders.php?action=list`).then(r => r.json()).catch(() => []),
      fetch(`${STAFF_BASE}/api_orders.php`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api_products.php?action=list`).then(r => r.json()).catch(() => []),
    ]).then(([customerOrders, staffOrders, prod]) => {
      const normalize = (items, source) =>
        (Array.isArray(items) ? items : []).map((order) => ({
          ...order,
          source,
          items:
            typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [],
        }));

      const combined = [
        ...normalize(customerOrders, 'Customer'),
        ...normalize(staffOrders, 'Staff'),
      ].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : Number(a.id);
        const dateB = b.created_at ? new Date(b.created_at).getTime() : Number(b.id);
        return dateB - dateA;
      });

      setOrders(combined);
      setProducts(Array.isArray(prod) ? prod : []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (range === 'all') return orders;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(range));
    return orders.filter(o => o.created_at && new Date(o.created_at) >= cutoff);
  }, [orders, range]);

  const totalRevenue = useMemo(() => filtered.reduce((s, o) => s + Number(o.total || 0), 0), [filtered]);
  const completedOrds = useMemo(() => filtered.filter(o => o.status === 'Completed'), [filtered]);
  const pendingOrds = useMemo(() => filtered.filter(o => o.status === 'Pending'), [filtered]);
  const avgOrderValue = useMemo(() => completedOrds.length ? totalRevenue / completedOrds.length : 0, [totalRevenue, completedOrds]);
  const salesByDay = useMemo(() => {
    const days = Number(range) || 7;
    const today = new Date();
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (Math.min(days, 30) - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const total = filtered
        .filter(o => o.created_at?.slice(0, 10) === key)
        .reduce((s, o) => s + Number(o.total || 0), 0);
      return { label, dateKey: key, total };
    });
  }, [filtered, range]);

  const statusBreakdown = useMemo(() => {
    const counts = { Pending: 0, Preparing: 0, 'To Receive': 0, Completed: 0 };
    filtered.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return [
      { label: 'Pending', value: counts.Pending, color: '#fbbf24' },
      { label: 'Preparing', value: counts.Preparing, color: '#38bdf8' },
      { label: 'To Receive', value: counts['To Receive'], color: '#a78bfa' },
      { label: 'Completed', value: counts.Completed, color: '#34d399' },
    ];
  }, [filtered]);

  const topProducts = useMemo(() => {
    const tally = {};
    filtered.forEach(o => {
      o.items.forEach(item => {
        const name = item.name || 'Unknown';
        tally[name] = (tally[name] || 0) + Number(item.qty || 0);
      });
    });
    return Object.entries(tally)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [filtered]);

  const topByRevenue = useMemo(() => {
    const tally = {};
    filtered.forEach(o => {
      o.items.forEach(item => {
        const name = item.name || 'Unknown';
        tally[name] = (tally[name] || 0) + Number(item.price || 0) * Number(item.qty || 0);
      });
    });
    return Object.entries(tally)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filtered]);

  const byWeekday = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const counts = Array(7).fill(0);
    filtered.forEach(o => {
      if (o.created_at) counts[new Date(o.created_at).getDay()]++;
    });
    return days.map((label, i) => ({ label, total: counts[i] }));
  }, [filtered]);

  const lowStock = useMemo(() => products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5), [products]);
  const outStock = useMemo(() => products.filter(p => Number(p.stock) === 0), [products]);
  const totalStock = useMemo(() => products.reduce((s, p) => s + Number(p.stock || 0), 0), [products]);
  const completionRate = filtered.length ? Math.round((completedOrds.length / filtered.length) * 100) : 0;
  const maxQty = topProducts[0]?.qty || 1;
  const maxRevenue = topByRevenue[0]?.revenue || 1;

  return (
    <div className="bg-[#f7f7f7] min-h-screen font-['DM_Sans']">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-6 xl:px-10 py-14">
        <div className="mb-12">
          <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-3">Admin Analytics</p>
          <h1 className="text-5xl font-serif font-bold tracking-tight">Business Reports</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">Order, revenue, product, and inventory reports for admin review.</p>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black">Period:</span>
          {[['7', 'Last 7 days'], ['30', 'Last 30 days'], ['all', 'All time']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${range === val ? 'bg-black text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <BarChart2 size={40} className="mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-sm">Loading analytics…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-14">
              <StatCard title="Total Revenue" value={peso(totalRevenue)} sub={`from ${filtered.length} orders`} icon={TrendingUp} accent="bg-gradient-to-br from-[#d4af37] to-[#b09c4a]" />
              <StatCard title="Completed Orders" value={completedOrds.length} sub={`${completionRate}% completion rate`} icon={CheckCircle} accent="bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <StatCard title="Avg. Order Value" value={peso(Math.round(avgOrderValue))} sub="per completed order" icon={ShoppingBag} accent="bg-gradient-to-br from-sky-400 to-sky-600" />
              <StatCard title="Pending Orders" value={pendingOrds.length} sub="awaiting action" icon={Clock} accent="bg-gradient-to-br from-orange-400 to-orange-600" />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1fr_380px] mb-14">
              <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-2">Revenue</p>
                    <h3 className="text-2xl font-serif font-bold">Daily Sales Trend</h3>
                    <p className="text-xs text-gray-400 mt-1">{range === 'all' ? 'All time' : `Last ${range} days`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-[#d4af37]">{peso(totalRevenue)}</p>
                  </div>
                </div>
                <BarChart data={salesByDay} height={200} />
              </div>

              <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl p-8 flex flex-col">
                <div className="mb-6">
                  <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-2">Breakdown</p>
                  <h3 className="text-2xl font-serif font-bold">Order Status</h3>
                </div>
                <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                  <DonutChart segments={statusBreakdown} size={180} />
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {statusBreakdown.map(seg => (
                      <div key={seg.label} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{seg.label}</p>
                          <p className="text-sm font-bold text-gray-900">{seg.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl p-8 mb-14">
              <SectionHeader eyebrow="Patterns" title="Orders by Day of Week" />
              <BarChart data={byWeekday} height={160} valueKey="total" labelKey="label" color={GOLD} color2={GOLD_L} valuePrefix="" />
            </div>

            <div className="grid gap-8 xl:grid-cols-2 mb-14">
              <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl p-8">
                <SectionHeader eyebrow="Best Sellers" title="Top Products by Units" />
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">No data available.</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((p, i) => (
                      <HorizBar key={p.name} rank={i + 1} label={p.name} value={p.qty} max={maxQty} color={GOLD} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl p-8">
                <SectionHeader eyebrow="Revenue Leaders" title="Top Products by Sales" />
                {topByRevenue.length === 0 ? (
                  <p className="text-sm text-gray-400">No data available.</p>
                ) : (
                  <div className="space-y-4">
                    {topByRevenue.map((p, i) => (
                      <HorizBar key={p.name} rank={i + 1} label={p.name} value={p.revenue} displayValue={`₱${fmt(Math.round(p.revenue))}`} max={maxRevenue} color="#10b981" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-14">
              <SectionHeader eyebrow="Inventory" title="Inventory Health" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Package size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Total Stock</p>
                    <p className="text-3xl font-bold font-serif">{fmt(totalStock)}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[24px] border border-yellow-100 shadow-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Low Stock Items</p>
                    <p className="text-3xl font-bold font-serif text-yellow-600">{lowStock.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[24px] border border-red-100 shadow-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Out of Stock</p>
                    <p className="text-3xl font-bold font-serif text-red-500">{outStock.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-14">
              <SectionHeader eyebrow="History" title="Recent Completed Orders" />
              <div className="bg-white rounded-[30px] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] uppercase tracking-[0.3em] text-gray-400 px-6 py-4 font-black">Order</th>
                        <th className="text-left text-[10px] uppercase tracking-[0.3em] text-gray-400 px-6 py-4 font-black">Customer</th>
                        <th className="text-left text-[10px] uppercase tracking-[0.3em] text-gray-400 px-6 py-4 font-black">Items</th>
                        <th className="text-left text-[10px] uppercase tracking-[0.3em] text-gray-400 px-6 py-4 font-black">Date</th>
                        <th className="text-right text-[10px] uppercase tracking-[0.3em] text-gray-400 px-6 py-4 font-black">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrds.slice(0, 10).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-gray-400">No completed orders in this period.</td>
                        </tr>
                      ) : (
                        completedOrds.slice(0, 10).map((o, i) => (
                          <tr key={o.id} className={`border-b border-gray-50 hover:bg-[#fdf8ec] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                            <td className="px-6 py-4 font-bold text-gray-900">#{o.id}</td>
                            <td className="px-6 py-4 text-gray-600">{o.customer || o.phone || '—'}</td>
                            <td className="px-6 py-4 text-gray-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                            <td className="px-6 py-4 text-gray-400 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td className="px-6 py-4 text-right font-semibold text-[#d4af37]">{peso(o.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
