export default function TableToolbar({
  title,
  search,
  onSearch,
  placeholder = "Search…",
  filters = [],
  children,
}) {
  return (
    <div className="table-toolbar">
      <span className="table-toolbar-title">{title}</span>

      <div className="toolbar-controls">
        <div className="search-wrap">
          <span className="s-icon">🔍</span>
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {filters.map((f, i) => {
          if (f.type === "date") {
            return (
              <input
                key={i}
                type="date"
                className="filter-select"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                title={f.title ?? "Filter by date"}
              />
            );
          }

          return (
            <select
              key={i}
              className="filter-select"
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        })}

        {children}
      </div>
    </div>
  );
}