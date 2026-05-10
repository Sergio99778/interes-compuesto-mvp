// ============================================================
// Caja de Ahorro — Calculadora de interés compuesto multi-aporte
// Cada ingreso crece independientemente desde su fecha de depósito
// hasta la fecha objetivo. El total es la suma de todos los finales.
// ============================================================

const state = {
  ingresos: [],
  charts: { pie: null, line: null },
};

const COLORS = [
  '#6366f1', '#ec4899', '#22c55e', '#f97316',
  '#06b6d4', '#eab308', '#8b5cf6', '#f43f5e',
];

// ---------- Math ----------

// A = P × (1 + r/n)^(n×t)
function compound(principal, annualRatePct, n, years) {
  if (years <= 0) return principal;
  const r = annualRatePct / 100;
  return principal * Math.pow(1 + r / n, n * years);
}

function yearsBetween(d1, d2) {
  return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

// ---------- Format ----------

const fmt = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const formatMoney = (n) => fmt.format(Number.isFinite(n) ? n : 0);

const todayISO = () => new Date().toISOString().slice(0, 10);

// ---------- Init ----------

function init() {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  document.getElementById('targetDate').value = future.toISOString().slice(0, 10);

  // Ejemplo del enunciado
  state.ingresos = [
    { id: 1, name: 'Alimentos', amount: 1000, date: todayISO() },
    { id: 2, name: 'Renta',     amount: 500,  date: todayISO() },
    { id: 3, name: 'Chetos',    amount: 500,  date: todayISO() },
  ];

  renderIngresos();
  attachGlobalListeners();
  calculate();
}

// ---------- Ingresos UI ----------

function renderIngresos() {
  const list = document.getElementById('ingresosList');
  if (state.ingresos.length === 0) {
    list.innerHTML = '<p class="empty">No hay ingresos. Agregá uno para empezar.</p>';
    return;
  }

  list.innerHTML = state.ingresos.map(ing => `
    <div class="ingreso-row" data-id="${ing.id}">
      <input type="text"   class="ing-name"   value="${escapeAttr(ing.name)}" placeholder="Concepto (ej: Alimentos)">
      <input type="number" class="ing-amount" value="${ing.amount}" min="0" step="0.01" placeholder="Monto">
      <input type="date"   class="ing-date"   value="${ing.date}">
      <button class="btn-remove" data-id="${ing.id}" title="Eliminar">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.ingreso-row').forEach(row => {
    const id = parseInt(row.dataset.id, 10);
    const ing = state.ingresos.find(x => x.id === id);

    row.querySelector('.ing-name').addEventListener('input', e => {
      ing.name = e.target.value;
      calculate();
    });
    row.querySelector('.ing-amount').addEventListener('input', e => {
      ing.amount = parseFloat(e.target.value) || 0;
      calculate();
    });
    row.querySelector('.ing-date').addEventListener('input', e => {
      ing.date = e.target.value;
      calculate();
    });
    row.querySelector('.btn-remove').addEventListener('click', () => {
      state.ingresos = state.ingresos.filter(x => x.id !== id);
      renderIngresos();
      calculate();
    });
  });
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function attachGlobalListeners() {
  document.getElementById('addIngreso').addEventListener('click', () => {
    const newId = (state.ingresos.reduce((m, i) => Math.max(m, i.id), 0)) + 1;
    state.ingresos.push({
      id: newId,
      name: 'Nuevo concepto',
      amount: 0,
      date: todayISO(),
    });
    renderIngresos();
    calculate();
  });

  ['rate', 'frequency', 'targetDate'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculate);
    document.getElementById(id).addEventListener('change', calculate);
  });
}

// ---------- Core calculation ----------

function calculate() {
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const n = parseFloat(document.getElementById('frequency').value);
  const targetDate = new Date(document.getElementById('targetDate').value);

  if (isNaN(targetDate.getTime())) return;

  const breakdown = state.ingresos
    .map(ing => {
      const depositDate = new Date(ing.date);
      if (isNaN(depositDate.getTime())) return null;
      const years = Math.max(0, yearsBetween(depositDate, targetDate));
      const final = compound(ing.amount, rate, n, years);
      return {
        id: ing.id,
        name: ing.name || 'Sin nombre',
        initial: ing.amount,
        final,
        gain: final - ing.amount,
        depositDate,
        years,
      };
    })
    .filter(Boolean);

  const totalInitial = breakdown.reduce((s, b) => s + b.initial, 0);
  const totalFinal = breakdown.reduce((s, b) => s + b.final, 0);
  const totalGain = totalFinal - totalInitial;
  const gainPct = totalInitial > 0 ? (totalGain / totalInitial) * 100 : 0;

  document.getElementById('totalInitial').textContent = formatMoney(totalInitial);
  document.getElementById('totalFinal').textContent = formatMoney(totalFinal);
  document.getElementById('totalGain').textContent = formatMoney(totalGain);
  document.getElementById('totalGainPct').textContent = `+${gainPct.toFixed(2)}% sobre el aporte`;

  renderBreakdown(breakdown, totalFinal);
  renderPieChart(breakdown);
  renderLineChart(breakdown, rate, n, targetDate);
}

function renderBreakdown(breakdown, totalFinal) {
  const container = document.getElementById('breakdown');

  if (breakdown.length === 0) {
    container.innerHTML = '<p class="empty">Agregá al menos un ingreso para ver el desglose.</p>';
    return;
  }

  const sorted = [...breakdown].sort((a, b) => b.final - a.final);

  container.innerHTML = `
    <h3>Detalle por concepto</h3>
    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Aporte inicial</th>
          <th>Tiempo (años)</th>
          <th>Valor final</th>
          <th>Rendimiento</th>
          <th>% del capital final</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(b => {
          const pct = totalFinal > 0 ? (b.final / totalFinal) * 100 : 0;
          return `
            <tr>
              <td><strong>${escapeAttr(b.name)}</strong></td>
              <td>${formatMoney(b.initial)}</td>
              <td>${b.years.toFixed(2)}</td>
              <td>${formatMoney(b.final)}</td>
              <td class="positive">+${formatMoney(b.gain)}</td>
              <td>
                <div class="bar-wrapper">
                  <div class="bar" style="width: ${pct}%"></div>
                  <span>${pct.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// ---------- Charts ----------

function renderPieChart(breakdown) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (state.charts.pie) state.charts.pie.destroy();

  if (breakdown.length === 0) return;

  state.charts.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: breakdown.map(b => b.name),
      datasets: [{
        data: breakdown.map(b => b.final),
        backgroundColor: breakdown.map((_, i) => COLORS[i % COLORS.length]),
        borderColor: '#1e293b',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#e2e8f0', padding: 14 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
              return `${ctx.label}: ${formatMoney(ctx.parsed)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderLineChart(breakdown, rate, n, targetDate) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (state.charts.line) state.charts.line.destroy();

  if (breakdown.length === 0) return;

  // Genera puntos mensuales desde el depósito más antiguo hasta la fecha objetivo
  const earliest = new Date(Math.min(...breakdown.map(b => b.depositDate.getTime())));
  const points = [];
  const labels = [];

  const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  while (cursor <= targetDate) {
    points.push(new Date(cursor));
    labels.push(cursor.toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  // Asegurar punto final exacto
  const last = points[points.length - 1];
  if (!last || last.getTime() !== targetDate.getTime()) {
    points.push(new Date(targetDate));
    labels.push(targetDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }));
  }

  const datasets = breakdown.map((b, i) => ({
    label: b.name,
    data: points.map(p => {
      if (p < b.depositDate) return null;
      const years = yearsBetween(b.depositDate, p);
      return compound(b.initial, rate, n, years);
    }),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: COLORS[i % COLORS.length] + '22',
    borderWidth: 2,
    tension: 0.25,
    fill: false,
    pointRadius: 0,
    pointHoverRadius: 4,
  }));

  // Línea total — la estrella del show
  datasets.push({
    label: 'Total',
    data: points.map(p => breakdown.reduce((sum, b) => {
      if (p < b.depositDate) return sum;
      const years = yearsBetween(b.depositDate, p);
      return sum + compound(b.initial, rate, n, years);
    }, 0)),
    borderColor: '#fbbf24',
    backgroundColor: '#fbbf2422',
    borderWidth: 3,
    borderDash: [],
    tension: 0.25,
    fill: true,
    pointRadius: 0,
    pointHoverRadius: 5,
  });

  state.charts.line = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#e2e8f0', padding: 14, usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', maxTicksLimit: 8 },
          grid: { color: '#33415544' },
        },
        y: {
          ticks: {
            color: '#94a3b8',
            callback: (v) => formatMoney(v),
          },
          grid: { color: '#33415544' },
        },
      },
    },
  });
}

// ---------- Go ----------

init();
