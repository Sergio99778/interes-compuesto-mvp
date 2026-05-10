# 💰 Interés Compuesto MVP

Calculadora web para determinar el capital final de una **caja de ahorro** alimentada por múltiples ingresos depositados en distintas fechas, aplicando interés compuesto. Visualiza cómo aporta cada peso al rendimiento total.

## ✨ Qué resuelve

Tenés una caja de ahorro donde mezclás dinero destinado a **varios fines** (alimentos, renta, gastos varios) y querés saber, en una fecha dada:

- ¿Cuánto capital total tenés?
- ¿Cuánto rendimiento generó cada ingreso por separado?
- ¿Qué porcentaje del capital final aporta cada concepto?

Cada ingreso crece **independientemente** desde su fecha de depósito hasta la fecha objetivo, usando la fórmula clásica de interés compuesto.

## 📐 La fórmula

```
A = P × (1 + r/n)^(n×t)
```

| Variable | Significado                             |
|----------|-----------------------------------------|
| `A`      | Capital final                           |
| `P`      | Capital inicial (principal)             |
| `r`      | Tasa anual en decimal (ej. 40% = 0.40)  |
| `n`      | Capitalizaciones por año                |
| `t`      | Tiempo en años                          |

> **Importante:** la *tasa anual* es solo la etiqueta — el resultado real depende de la **capitalización**. La misma TNA del 40% rinde distinto si capitaliza diaria, mensual, trimestral o anual.

## 🎛️ Capitalizaciones soportadas

| Frecuencia  | `n`  | TEA equivalente con 40% TNA |
|-------------|------|-----------------------------|
| Diaria      | 365  | ≈ 49.15%                    |
| Mensual     | 12   | ≈ 48.21%                    |
| Trimestral  | 4    | ≈ 46.41%                    |
| Semestral   | 2    | ≈ 44.00%                    |
| Anual       | 1    | 40.00%                      |

## 🚀 Cómo usarlo

No requiere instalación ni build. Solo necesitás un servidor HTTP estático.

### Opción 1 — Python (sin dependencias)

```bash
git clone https://github.com/Sergio99778/interes-compuesto-mvp.git
cd interes-compuesto-mvp
python3 -m http.server 8765
```

Abrí http://localhost:8765 en el navegador.

### Opción 2 — Node (si tenés npx)

```bash
npx serve .
```

### Opción 3 — Live Server de VS Code

Click derecho sobre `index.html` → **Open with Live Server**.

## 🧱 Stack

- **HTML + CSS + JavaScript vanilla** — sin frameworks, sin build step
- **[Chart.js](https://www.chartjs.org/) 4.4.0** vía CDN para los gráficos

## 📊 Qué incluye la UI

- Configuración global: tasa anual, frecuencia de capitalización, fecha objetivo
- Lista dinámica de ingresos (concepto + monto + fecha de depósito)
- Cards con capital aportado, capital final y rendimiento (con %)
- Tabla detallada por concepto con barras de aporte porcentual
- **Doughnut chart**: aporte de cada ingreso al capital final
- **Line chart**: evolución mes a mes de cada ingreso + línea total

## 📁 Estructura

```
interes-compuesto-mvp/
├── index.html      # Estructura
├── styles.css      # Estilos (dark theme)
├── app.js          # Lógica + cálculo + gráficos
└── README.md
```

## 🧮 Ejemplo del enunciado

| Concepto  | Monto | Fecha       |
|-----------|-------|-------------|
| Alimentos | 1000  | hoy         |
| Renta     | 500   | hoy         |
| Chetos    | 500   | hoy         |

Con **40% TNA, capitalización mensual, a 1 año**:

- Capital inicial: $2,000.00
- Capital final: **$2,964.27**
- Rendimiento: +$964.27 (+48.21%)

## 🛣️ Posibles mejoras

- [ ] Aportes recurrentes (plan de ahorro mensual)
- [ ] Persistencia en `localStorage`
- [ ] Comparar múltiples escenarios de tasa lado a lado
- [ ] Exportar a CSV / PDF
- [ ] Soporte multi-moneda

## 📄 Licencia

MIT
