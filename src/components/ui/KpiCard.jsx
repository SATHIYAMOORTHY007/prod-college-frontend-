function KpiCard({ label, value, icon: Icon, tone = 'indigo', hint, isLoading = false }) {
  return (
    <div className="surface kpi-card">
      {Icon && (
        <div className={`kpi-icon tone-${tone}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <div className="kpi-label">{label}</div>
        {isLoading ? (
          <span className="skeleton mt-2" style={{ width: 70, height: 26 }} />
        ) : (
          <div className="kpi-value tabular">{value ?? '—'}</div>
        )}
        {hint && <div className="kpi-hint">{hint}</div>}
      </div>
    </div>
  )
}

export default KpiCard
