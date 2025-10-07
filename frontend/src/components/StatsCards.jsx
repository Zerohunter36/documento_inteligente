const cards = [
  { key: 'quota', label: 'Hojas contratadas', color: 'from-blue-400 to-blue-600' },
  { key: 'used', label: 'Hojas utilizadas', color: 'from-sky-400 to-sky-600' },
  { key: 'remaining', label: 'Hojas disponibles', color: 'from-emerald-400 to-emerald-600' },
  { key: 'overagePages', label: 'Excedente', color: 'from-amber-400 to-amber-600' },
];

export default function StatsCards({ stats }) {
  const remaining = Math.max((stats?.quota || 0) - (stats?.used || 0), 0);
  const data = { ...stats, remaining };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${card.color} text-white px-5 py-3 text-sm font-semibold uppercase tracking-wide`}>
            {card.label}
          </div>
          <div className="px-6 py-6">
            <p className="text-3xl font-bold text-accent">{data[card.key] ?? 0}</p>
            {card.key === 'overagePages' && stats?.overageCost > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Costo adicional estimado: ${stats.overageCost.toFixed(2)} MXN
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
