const state = {
  rows: [],
  profiles: {},
  catalog: {},
  risks: [],
  manifest: null,
  selectedCountry: null,
  currentView: 'compare',
};

const CATEGORIES = ['External', 'Fiscal', 'Monetary', 'Real', 'Financial', 'Institutional'];
const DEFAULTS = {
  category: 'External',
  indicator: 'current_acct',
  year: '2025e',
};
const KEY_METRICS = {
  Monetary: ['inflation_cpi', 'policy_rate', 'fx_regime'],
  External: ['current_acct', 'niip', 'st_debt_reserves'],
  Fiscal: ['fiscal_balance', 'govt_gross_debt'],
  Real: ['gdp_growth', 'gdp_pc'],
  Institutional: ['wb_rule_of_law', 'wb_govt_effectiveness', 'capital_controls'],
};

const RADAR_DIMENSIONS = [
  {
    id: 'external_position',
    label: 'Posición externa',
    metrics: [
      { id: 'current_acct', direction: 'higher', year: '2025e' },
      { id: 'niip', direction: 'higher', year: '2025e' },
      { id: 'st_debt_reserves', direction: 'lower', year: '2025e' },
      { id: 'ext_debt_total', direction: 'lower', year: '2025e' },
    ],
  },
  {
    id: 'fiscal_solidity',
    label: 'Solidez fiscal',
    metrics: [
      { id: 'fiscal_balance', direction: 'higher', year: '2025e' },
      { id: 'govt_gross_debt', direction: 'lower', year: '2025e' },
    ],
  },
  {
    id: 'monetary_stability',
    label: 'Estabilidad monetaria',
    metrics: [
      { id: 'inflation_cpi', direction: 'lower', year: '2025e' },
      { id: 'policy_rate', direction: 'lower', year: '2025e' },
      { id: 'reer_yoy', direction: 'neutral_abs', year: '2025e' },
    ],
  },
  {
    id: 'real_performance',
    label: 'Desempeño real',
    metrics: [
      { id: 'gdp_growth', direction: 'higher', year: '2025e' },
      { id: 'gdp_pc', direction: 'higher', year: '2025e' },
      { id: 'labor_prod', direction: 'higher', year: '2025e' },
      { id: 'tfp_growth', direction: 'higher', year: '2025e' },
    ],
  },
  {
    id: 'institutional_quality',
    label: 'Calidad institucional',
    metrics: [
      { id: 'wb_rule_of_law', direction: 'higher', year: '2024' },
      { id: 'wb_govt_effectiveness', direction: 'higher', year: '2024' },
      { id: 'wb_regulatory_quality', direction: 'higher', year: '2024' },
      { id: 'wb_control_of_corruption', direction: 'higher', year: '2024' },
    ],
  },
];

const VULNERABILITY_INDICATORS = [
  {
    id: 'current_acct',
    label: 'Cuenta corriente',
    year: '2025e',
    rule: (v) => v <= -4 ? 3 : v <= -2 ? 2 : 1,
    criterion: 'alto ≤ -4% PIB; medio ≤ -2% PIB',
  },
  {
    id: 'niip',
    label: 'NIIP',
    year: '2025e',
    rule: (v) => v <= -40 ? 3 : v <= -20 ? 2 : 1,
    criterion: 'alto ≤ -40% PIB; medio ≤ -20% PIB',
  },
  {
    id: 'ext_debt_total',
    label: 'Deuda externa',
    year: '2025e',
    rule: (v) => v >= 75 ? 3 : v >= 50 ? 2 : 1,
    criterion: 'alto ≥ 75% PIB; medio ≥ 50% PIB',
  },
  {
    id: 'st_debt_reserves',
    label: 'Deuda CP / reservas',
    year: '2025e',
    rule: (v) => v >= 100 ? 3 : v >= 60 ? 2 : 1,
    criterion: 'alto ≥ 100%; medio ≥ 60%',
  },
  {
    id: 'fiscal_balance',
    label: 'Balance fiscal',
    year: '2025e',
    rule: (v) => v <= -5 ? 3 : v <= -3 ? 2 : 1,
    criterion: 'alto ≤ -5% PIB; medio ≤ -3% PIB',
  },
  {
    id: 'govt_gross_debt',
    label: 'Deuda pública',
    year: '2025e',
    rule: (v) => v >= 90 ? 3 : v >= 60 ? 2 : 1,
    criterion: 'alto ≥ 90% PIB; medio ≥ 60% PIB',
  },
  {
    id: 'inflation_cpi',
    label: 'Inflación',
    year: '2025e',
    rule: (v) => v >= 10 ? 3 : v >= 5 ? 2 : 1,
    criterion: 'alto ≥ 10%; medio ≥ 5%',
  },
];


const SCATTER_PRESETS = [
  { label: 'Inflación vs. tasa de política', x: 'inflation_cpi', y: 'policy_rate' },
  { label: 'Cuenta corriente vs. REER', x: 'current_acct', y: 'reer_yoy' },
  { label: 'Deuda pública vs. balance fiscal', x: 'govt_gross_debt', y: 'fiscal_balance' },
  { label: 'PIB per cápita vs. crecimiento', x: 'gdp_pc', y: 'gdp_growth' },
  { label: 'Reservas vs. deuda corto plazo', x: 'int_reserves', y: 'st_ext_debt' },
  { label: 'Estado de derecho vs. crecimiento', x: 'wb_rule_of_law', y: 'gdp_growth' },
];

const $ = (id) => document.getElementById(id);

async function loadData() {
  const [rows, profiles, catalog, risks, manifest] = await Promise.all([
    fetch('data/g20_long.json').then(r => r.json()),
    fetch('data/country_profiles.json').then(r => r.json()),
    fetch('data/indicators_catalog.json').then(r => r.json()),
    fetch('data/vulnerability_scores.json').then(r => r.json()),
    fetch('data/dashboard_manifest.json').then(r => r.json()).catch(() => null),
  ]);
  state.rows = rows;
  state.profiles = profiles;
  state.catalog = catalog;
  state.risks = risks;
  state.manifest = manifest;
  state.selectedCountry = Object.keys(profiles).includes('Mexico') ? 'Mexico' : Object.keys(profiles)[0];
  $('dataStatus').textContent = `${rows.length.toLocaleString()} observations · ${Object.keys(profiles).length} countries`;
}

function init() {
  initTabs();
  initCompareControls();
  initCountryControls();
  initScatterControls();
  renderCompare();
  renderSidePanel();
  renderCountryView();
  renderScatter();
  renderVulnerabilities();
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      document.querySelectorAll('.tab').forEach(b => b.classList.toggle('is-active', b === btn));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
      $(`view-${state.currentView}`).classList.add('is-active');
      if (state.currentView === 'compare') renderCompare();
      if (state.currentView === 'country') renderCountryView();
      if (state.currentView === 'relations') renderScatter();
      if (state.currentView === 'vulnerabilities') renderVulnerabilities();
    });
  });
}

function initCompareControls() {
  const categorySelect = $('categorySelect');
  categorySelect.innerHTML = CATEGORIES.map(c => `<option value="${c}">${labelCategory(c)}</option>`).join('');
  categorySelect.value = DEFAULTS.category;
  categorySelect.addEventListener('change', () => {
    populateIndicatorSelect();
    populateYearSelect();
    renderCompare();
  });
  $('indicatorSelect').addEventListener('change', () => { populateYearSelect(); renderCompare(); });
  $('yearSelect').addEventListener('change', renderCompare);
  $('sortSelect').addEventListener('change', renderCompare);
  $('groupSelect').addEventListener('change', renderCompare);
  $('resetSelection').addEventListener('click', () => { state.selectedCountry = null; renderCompare(); renderSidePanel(); });
  $('openCountryView').addEventListener('click', () => switchToCountry(state.selectedCountry));
  populateIndicatorSelect();
  $('indicatorSelect').value = DEFAULTS.indicator;
  populateYearSelect();
}

function labelCategory(c) {
  return ({External: 'Externo', Fiscal: 'Fiscal', Monetary: 'Monetario', Real: 'Real', Financial: 'Financiero', Institutional: 'Institucional'}[c] || c);
}

function numericIndicators(category = null) {
  return Object.values(state.catalog)
    .filter(d => d.numeric && (category ? d.category === category : true) && availableRowsForIndicator(d.indicator_id).length)
    .sort((a,b) => `${a.category}-${a.label}`.localeCompare(`${b.category}-${b.label}`));
}

function availableRowsForIndicator(indicatorId) {
  return state.rows.filter(r => r.indicator_id === indicatorId && r.value !== null && !r.missing);
}

function populateIndicatorSelect() {
  const category = $('categorySelect').value;
  const opts = numericIndicators(category);
  $('indicatorSelect').innerHTML = opts.map(d => `<option value="${d.indicator_id}">${d.label}</option>`).join('');
  if (!opts.find(d => d.indicator_id === $('indicatorSelect').value)) $('indicatorSelect').value = opts[0]?.indicator_id || '';
}

function populateYearSelect() {
  const indicator = $('indicatorSelect').value;
  const years = [...new Set(state.rows.filter(r => r.indicator_id === indicator && r.value !== null).map(r => r.year))];
  const ordered = ['2025e', '2024', 'last avail.', 'static'].filter(y => years.includes(y)).concat(years.filter(y => !['2025e','2024','last avail.','static'].includes(y)));
  $('yearSelect').innerHTML = ordered.map(y => `<option value="${y}">${y}</option>`).join('');
  $('yearSelect').value = ordered.includes(DEFAULTS.year) ? DEFAULTS.year : ordered[0];
}

function filteredCompareRows() {
  const indicator = $('indicatorSelect').value;
  const year = $('yearSelect').value;
  const group = $('groupSelect').value;
  const sort = $('sortSelect').value;
  let rows = state.rows.filter(r => r.indicator_id === indicator && r.year === year && r.value !== null && !r.missing);
  if (group !== 'All') rows = rows.filter(r => r.country_group === group);
  rows.sort((a,b) => sort === 'asc' ? a.value - b.value : b.value - a.value);
  return rows;
}

function renderCompare() {
  const rows = filteredCompareRows();
  const indicatorId = $('indicatorSelect').value;
  const meta = state.catalog[indicatorId] || {};
  $('chartTitle').textContent = `${meta.label || indicatorId} · ${$('yearSelect').value}`;
  $('chartSubtitle').textContent = `${labelCategory(meta.category)}${meta.unit ? ` · ${meta.unit}` : ''}`;
  $('sourceNote').textContent = meta.source ? `Fuente / nota: ${meta.source}` : 'Sin fuente registrada para este indicador.';

  const countries = rows.map(r => r.country).reverse();
  const values = rows.map(r => r.value).reverse();
  const raw = rows.map(r => r.raw || formatValue(r.value, r.unit)).reverse();
  const colors = values.map(v => v < 0 ? '#8B9EB7' : '#2D5FA8');
  const selected = state.selectedCountry;
  const lineColors = countries.map(c => c === selected ? '#1A1A2E' : 'rgba(0,0,0,0)');

  Plotly.react('barChart', [{
    type: 'bar', orientation: 'h', x: values, y: countries,
    marker: { color: colors, line: { color: lineColors, width: countries.map(c => c === selected ? 2 : 0) } },
    customdata: raw,
    hovertemplate: '<b>%{y}</b><br>Value: %{customdata}<extra></extra>',
  }], {
    margin: { l: 118, r: 26, t: 8, b: 44 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#FFFFFF',
    font: { family: 'IBM Plex Sans', color: '#1A1A2E' },
    xaxis: { zeroline: !!meta.zero_line, zerolinecolor: '#1A1A2E', gridcolor: '#E2E4E8', title: meta.unit || '' },
    yaxis: { tickfont: { size: 12 } },
    bargap: .34,
    height: Math.max(480, countries.length * 28 + 90),
  }, { responsive: true, displayModeBar: false });

  $('barChart').on('plotly_click', (ev) => {
    state.selectedCountry = ev.points?.[0]?.y;
    renderCompare();
    renderSidePanel();
    $('countrySelect').value = state.selectedCountry;
  });
}

function initCountryControls() {
  const countries = Object.keys(state.profiles).sort();
  $('countrySelect').innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join('');
  $('countrySelect').value = state.selectedCountry;
  $('countrySelect').addEventListener('change', () => { state.selectedCountry = $('countrySelect').value; renderCountryView(); renderSidePanel(); });
}

function switchToCountry(country) {
  if (!country) return;
  state.selectedCountry = country;
  $('countrySelect').value = country;
  document.querySelector('.tab[data-view="country"]').click();
}

function renderSidePanel() {
  const country = state.selectedCountry;
  $('openCountryView').disabled = !country;
  if (!country || !state.profiles[country]) {
    $('sideCountry').textContent = 'Selecciona un país';
    $('sideGroup').textContent = 'Haz clic en una barra para ver su perfil compacto.';
    $('riskBadges').innerHTML = '';
    $('countrySnapshot').innerHTML = '';
    return;
  }
  const profile = state.profiles[country];
  $('sideCountry').textContent = country;
  $('sideGroup').textContent = profile.country_group || '';
  renderRiskBadges(country, 'riskBadges');
  $('countrySnapshot').innerHTML = Object.entries(KEY_METRICS).map(([category, ids]) => {
    const rows = ids.map(id => metricRow(profile, id)).filter(Boolean).join('');
    if (!rows) return '';
    return `<div class="snapshot-section"><h3>${labelCategory(category)}</h3>${rows}</div>`;
  }).join('');
}

function metricRow(profile, indicatorId) {
  const meta = state.catalog[indicatorId] || {};
  const value = getBestValue(profile, indicatorId);
  if (!value) return null;
  return `<div class="metric-row"><span>${meta.label || indicatorId}</span><span class="metric-value">${displayMetric(value)}</span></div>`;
}

function getBestValue(profile, indicatorId, preferredYears = ['2025e', '2024', 'last avail.', 'static']) {
  for (const y of preferredYears) {
    const v = profile.flat?.[`${indicatorId}__${y}`];
    if (v && !isMissingValue(v)) return v;
  }
  const found = Object.entries(profile.flat || {}).find(([k,v]) => k.startsWith(`${indicatorId}__`) && !isMissingValue(v));
  return found?.[1] || null;
}

function isMissingValue(v) { return v.value === null && !v.raw && !v.text_value; }
function displayMetric(v) { return v.raw || v.text_value || formatValue(v.value, v.unit); }
function formatValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  const n = Math.abs(value) >= 1000 ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return unit ? `${n} ${unit}` : n;
}

function riskFor(country) { return state.risks.find(r => r.country === country); }
function renderRiskBadges(country, containerId) {
  const risk = riskFor(country);
  if (!risk) { $(containerId).innerHTML = ''; return; }
  const badges = [
    ['External', risk.external_risk], ['Fiscal', risk.fiscal_risk], ['Monetary', risk.monetary_risk]
  ];
  $(containerId).innerHTML = badges.map(([label, level]) => `<div class="badge"><small>${label}</small>${dots(level)}</div>`).join('');
}
function dots(level) {
  const n = { low: 1, medium: 2, high: 3 }[level] || 0;
  return `<div class="dots">${[1,2,3].map(i => `<span class="dot ${i <= n ? `on ${level}` : ''}"></span>`).join('')}</div>`;
}

function renderCountryView() {
  const country = state.selectedCountry || $('countrySelect').value;
  if (!country) return;

  const profile = state.profiles[country];
  $('countrySelect').value = country;

  const risk = riskFor(country);

  $('countryHeader').innerHTML = [
    kpi('Group', profile.country_group || '—'),
    kpi('Overall risk', risk?.overall_risk || '—'),
    kpi('Inflation 2025e', displayMetric(getBestValue(profile, 'inflation_cpi', ['2025e']))),
    kpi('GDP growth 2025e', displayMetric(getBestValue(profile, 'gdp_growth', ['2025e']))),
  ].join('');

  ensureCountryRadarSection();
  renderRadarChart(country);

  $('countryTables').innerHTML = CATEGORIES
    .map(category => countryCategoryTable(profile, category))
    .filter(Boolean)
    .join('');
}
function kpi(label, value) { return `<div class="kpi"><div class="label">${label}</div><div class="num">${value || '—'}</div></div>`; }

function countryCategoryTable(profile, category) {
  const items = profile.categories?.[category];
  if (!items) return '';
  const rows = Object.entries(items).map(([id, values]) => {
    const meta = state.catalog[id] || {};
    const v2024 = values['2024'] ? displayMetric(values['2024']) : '—';
    const v2025 = values['2025e'] ? displayMetric(values['2025e']) : '—';
    const vlast = values['last avail.'] ? displayMetric(values['last avail.']) : (values['static'] ? displayMetric(values['static']) : '—');
    return `<tr><td>${meta.label || id}</td><td class="value">${v2024}</td><td class="value">${v2025}</td><td class="value">${vlast}</td></tr>`;
  }).join('');
  return `<details open><summary>${labelCategory(category)}</summary><table><thead><tr><th>Indicador</th><th>2024</th><th>2025e</th><th>Otro</th></tr></thead><tbody>${rows}</tbody></table></details>`;
}


function ensureCountryRadarSection() {
  if ($('countryRadar')) return;

  const header = $('countryHeader');
  if (!header) return;

  header.insertAdjacentHTML('afterend', `
    <section class="radar-section">
      <div class="radar-card">
        <div>
          <p class="eyebrow">Radar macroeconómico</p>
          <h3 id="radarTitle">Perfil relativo dentro del G20</h3>
          <p class="muted radar-note">
            Puntuaciones normalizadas de 0 a 100. Un valor alto significa mejor posición relativa dentro del G20, no una calificación absoluta.
          </p>
        </div>
        <div id="countryRadar" class="plot radar-plot"></div>
      </div>

      <aside class="radar-explain" id="radarExplain"></aside>
    </section>
  `);
}

function rowFor(country, indicatorId, preferredYear = '2025e') {
  const exact = state.rows.find(r =>
    r.country === country &&
    r.indicator_id === indicatorId &&
    r.year === preferredYear &&
    r.value !== null &&
    !r.missing
  );

  if (exact) return exact;

  const fallbacks = ['2025e', '2024', 'last avail.', 'static'];

  for (const year of fallbacks) {
    const row = state.rows.find(r =>
      r.country === country &&
      r.indicator_id === indicatorId &&
      r.year === year &&
      r.value !== null &&
      !r.missing
    );

    if (row) return row;
  }

  return null;
}

function indicatorRelativeScore(country, metric) {
  const preferredYear = metric.year || '2025e';

  const rowsExact = state.rows.filter(r =>
    r.indicator_id === metric.id &&
    r.year === preferredYear &&
    r.value !== null &&
    !r.missing
  );

  const sample = rowsExact.length
    ? rowsExact
    : state.rows.filter(r =>
        r.indicator_id === metric.id &&
        r.value !== null &&
        !r.missing
      );

  const countryRow = sample.find(r => r.country === country) || rowFor(country, metric.id, preferredYear);

  if (!countryRow || !sample.length) return null;

  let values = sample.map(r => Number(r.value)).filter(Number.isFinite);
  let countryValue = Number(countryRow.value);

  if (!Number.isFinite(countryValue) || values.length < 2) return null;

  if (metric.direction === 'neutral_abs') {
    values = values.map(v => Math.abs(v));
    countryValue = Math.abs(countryValue);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) return 50;

  let score;

  if (metric.direction === 'lower' || metric.direction === 'neutral_abs') {
    score = 100 * (max - countryValue) / (max - min);
  } else {
    score = 100 * (countryValue - min) / (max - min);
  }

  return Math.max(0, Math.min(100, score));
}

function radarScoresFor(country) {
  return RADAR_DIMENSIONS.map(dim => {
    const scores = dim.metrics
      .map(metric => indicatorRelativeScore(country, metric))
      .filter(v => v !== null);

    const score = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    return { ...dim, score };
  });
}


function radarScoreTone(score) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return 'missing';

  const n = Number(score);

  if (n >= 70) return 'good';
  if (n >= 40) return 'medium';
  return 'bad';
}

function renderRadarChart(country) {
  if (!$('countryRadar')) return;

  const dims = radarScoresFor(country);

  const labels = dims.map(d => d.label);
  const values = dims.map(d => d.score === null ? 0 : Math.round(d.score));

  const closedLabels = [...labels, labels[0]];
  const closedValues = [...values, values[0]];

  $('radarTitle').textContent = `${country}: perfil relativo dentro del G20`;

  $('radarExplain').innerHTML = dims.map(d => {
    const rounded = d.score === null ? null : Math.round(d.score);
    const tone = radarScoreTone(rounded);

    return `
      <div class="radar-score-row">
        <span>${d.label}</span>
        <strong class="radar-score-value ${tone}">${rounded === null ? '—' : rounded}</strong>
      </div>
    `;
  }).join('') + `
    <div class="radar-score-legend">
      <span><i class="legend-dot good"></i> Fuerte</span>
      <span><i class="legend-dot medium"></i> Medio</span>
      <span><i class="legend-dot bad"></i> Débil</span>
    </div>
    <p class="muted radar-note">
      Cada eje combina varios indicadores normalizados dentro del G20. Verde no significa perfecto: significa mejor posición relativa.
    </p>
  `;

  Plotly.react('countryRadar', [{
    type: 'scatterpolar',
    r: closedValues,
    theta: closedLabels,
    fill: 'toself',
    name: country,
    line: { color: '#2D5FA8', width: 2 },
    fillcolor: 'rgba(45,95,168,.18)',
    marker: { color: '#2D5FA8', size: 6 },
    hovertemplate: '<b>%{theta}</b><br>Score: %{r}/100<extra></extra>',
  }], {
    margin: { l: 28, r: 28, t: 12, b: 12 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'IBM Plex Sans', color: '#1A1A2E' },
    polar: {
      bgcolor: 'rgba(0,0,0,0)',
      radialaxis: {
        visible: true,
        range: [0, 100],
        tickvals: [25, 50, 75, 100],
        gridcolor: '#E2E4E8'
      },
      angularaxis: {
        gridcolor: '#E2E4E8'
      },
    },
    showlegend: false,
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function riskLevelLabel(score) {
  return ({ 1: 'bajo', 2: 'medio', 3: 'alto' }[score] || 'sin dato');
}

function vulnerabilityCell(country, cfg) {
  const row = rowFor(country, cfg.id, cfg.year);

  if (!row || row.value === null || row.missing) {
    return {
      score: 0,
      raw: 'n/a',
      level: 'sin dato',
      criterion: cfg.criterion
    };
  }

  const score = cfg.rule(Number(row.value));

  return {
    score,
    raw: row.raw || formatValue(row.value, row.unit),
    level: riskLevelLabel(score),
    criterion: cfg.criterion,
    source: state.catalog[cfg.id]?.source || '',
  };
}


function initScatterControls() {
  const opts = numericIndicators().filter(d => ['2024','2025e'].some(y => d.available_years?.includes(y)));
  const html = opts.map(d => `<option value="${d.indicator_id}">${d.label} · ${labelCategory(d.category)}</option>`).join('');
  $('xIndicatorSelect').innerHTML = html;
  $('yIndicatorSelect').innerHTML = html;
  $('xIndicatorSelect').value = 'inflation_cpi';
  $('yIndicatorSelect').value = 'policy_rate';
  $('presetSelect').innerHTML = SCATTER_PRESETS.map((p,i) => `<option value="${i}">${p.label}</option>`).join('');
  ['xIndicatorSelect','yIndicatorSelect','scatterYearSelect'].forEach(id => $(id).addEventListener('change', renderScatter));
  $('presetSelect').addEventListener('change', () => {
    const p = SCATTER_PRESETS[Number($('presetSelect').value)];
    $('xIndicatorSelect').value = p.x; $('yIndicatorSelect').value = p.y; renderScatter();
  });
}

function valueByCountry(indicator, year) {
  const m = new Map();
  state.rows.filter(r => r.indicator_id === indicator && r.year === year && r.value !== null && !r.missing).forEach(r => m.set(r.country, r));
  return m;
}
function renderScatter() {
  const xId = $('xIndicatorSelect').value, yId = $('yIndicatorSelect').value, year = $('scatterYearSelect').value;
  const xMap = valueByCountry(xId, year), yMap = valueByCountry(yId, year);
  const countries = [...xMap.keys()].filter(c => yMap.has(c));
  const tracesByGroup = ['Advanced economy','Emerging economy'].map(group => {
    const cs = countries.filter(c => state.profiles[c]?.country_group === group);
    return {
      type: 'scatter', mode: 'markers+text', name: group,
      x: cs.map(c => xMap.get(c).value), y: cs.map(c => yMap.get(c).value), text: cs,
      textposition: 'top center', textfont: { size: 10 },
      marker: { size: 12, color: group === 'Advanced economy' ? '#2D5FA8' : '#8B9EB7', line: { color: '#fff', width: 1.5 } },
      customdata: cs.map(c => [xMap.get(c).raw, yMap.get(c).raw]),
      hovertemplate: '<b>%{text}</b><br>X: %{customdata[0]}<br>Y: %{customdata[1]}<extra></extra>',
    };
  });
  const xMeta = state.catalog[xId] || {}, yMeta = state.catalog[yId] || {};
  $('scatterTitle').textContent = `${xMeta.label} vs. ${yMeta.label} · ${year}`;
  Plotly.react('scatterPlot', tracesByGroup, {
    margin: { l: 72, r: 28, t: 20, b: 68 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'IBM Plex Sans', color: '#1A1A2E' },
    xaxis: { title: `${xMeta.label}${xMeta.unit ? ` (${xMeta.unit})` : ''}`, gridcolor: '#E2E4E8', zerolinecolor: '#1A1A2E' },
    yaxis: { title: `${yMeta.label}${yMeta.unit ? ` (${yMeta.unit})` : ''}`, gridcolor: '#E2E4E8', zerolinecolor: '#1A1A2E' },
    legend: { orientation: 'h', y: 1.08 },
  }, { responsive: true, displayModeBar: false });
}

function adjustRiskHeatmapCard() {
  const plot = $('riskHeatmap');
  if (!plot) return;

  const card = plot.closest('.card, .panel, section');
  if (!card) return;

  const svg = plot.querySelector('svg.main-svg');

  const svgHeight = svg
    ? Number(svg.getAttribute('height')) || parseFloat(getComputedStyle(svg).height) || 680
    : 680;

  const finalPlotHeight = Math.max(680, svgHeight);
  const finalCardHeight = finalPlotHeight + 230;

  plot.style.height = `${finalPlotHeight}px`;
  plot.style.minHeight = `${finalPlotHeight}px`;
  plot.style.overflow = 'visible';

  card.style.height = 'auto';
  card.style.minHeight = `${finalCardHeight}px`;
  card.style.overflow = 'visible';

  if (window.Plotly) {
    try {
      Plotly.Plots.resize(plot);
    } catch (e) {}
  }
}

function renderVulnerabilities() {
  const riskRank = { high: 3, medium: 2, low: 1 };

  const countries = [...state.risks]
    .sort((a, b) => (riskRank[b.overall_risk] || 0) - (riskRank[a.overall_risk] || 0))
    .map(r => r.country);

  const x = VULNERABILITY_INDICATORS.map(c => c.label);
  const y = countries;

  const z = countries.map(country =>
    VULNERABILITY_INDICATORS.map(cfg => vulnerabilityCell(country, cfg).score)
  );

  const customdata = countries.map(country =>
    VULNERABILITY_INDICATORS.map(cfg => {
      const cell = vulnerabilityCell(country, cfg);
      const meta = state.catalog[cfg.id] || {};

      return [
        cell.raw,
        cell.level,
        cell.criterion,
        meta.unit || '',
        meta.source || ''
      ];
    })
  );

  Plotly.react('riskHeatmap', [{
    type: 'heatmap',
    x,
    y,
    z,
    customdata,
    xgap: 2,
    ygap: 2,
    zmin: 0,
    zmax: 3,
    colorscale: [
      [0, '#FFFFFF'],
      [0.001, '#FFFFFF'],
      [0.25, '#FFFFFF'],
      [0.34, '#2F7D68'],
      [0.55, '#E8C547'],
      [0.78, '#E88A3A'],
      [1, '#C43D32'],
    ],
    showscale: true,
    colorbar: {
      title: '',
      tickmode: 'array',
      tickvals: [1, 2, 3],
      ticktext: ['Bajo', 'Medio', 'Alto'],
      thickness: 10,
      len: 0.55,
      outlinewidth: 0,
      tickfont: {
        size: 11,
        color: '#667085'
      }
    },
    hovertemplate: '<b>%{y}</b><br>%{x}: %{customdata[0]} %{customdata[3]}<br>Presión: %{customdata[1]}<br>Criterio: %{customdata[2]}<extra></extra>',
  }], {
    margin: { l: 122, r: 32, t: 145, b: 36 },
    height: Math.max(560, countries.length * 34 + 210),
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'IBM Plex Sans',
      color: '#1A1A2E'
    },
    xaxis: {
      tickangle: -32,
      side: 'top',
      automargin: true,
      tickfont: {
        size: 12,
        color: '#1A1A2E'
      }
    },
    yaxis: {
      autorange: 'reversed',
      automargin: true,
      tickfont: {
        size: 12,
        color: '#1A1A2E'
      }
    },
  }, {
    responsive: true,
    displayModeBar: false
  });


  requestAnimationFrame(() => {
    const plot = $('riskHeatmap');
    if (!plot) return;

    const card = plot.closest('.card, .panel, section');
    if (!card) return;

    const plotHeight = plot.getBoundingClientRect().height || 0;
    card.style.minHeight = `${Math.ceil(plotHeight + 190)}px`;
    card.style.height = 'auto';
    card.style.overflow = 'visible';
  });

  setTimeout(adjustRiskHeatmapCard, 80);
  setTimeout(adjustRiskHeatmapCard, 350);

  $('riskSignals').innerHTML = `
    <div class="risk-help">
      <p>
        El heatmap muestra <strong>indicadores concretos</strong>, no solo categorías abstractas.
        El color indica presión relativa según umbrales: bajo, medio o alto.
      </p>
    </div>
  ` + [...state.risks]
    .sort((a, b) => (riskRank[b.overall_risk] || 0) - (riskRank[a.overall_risk] || 0))
    .map(r => `
      <div class="risk-item">
        <strong>${r.country}<span class="risk-pill ${r.overall_risk}">${r.overall_risk}</span></strong>
        ${
          r.signals?.length
            ? `<ul>${r.signals.map(s => `<li>${s}</li>`).join('')}</ul>`
            : '<p class="muted">Sin señales fuertes.</p>'
        }
      </div>
    `).join('');
}

loadData().then(init).catch(err => {
  console.error(err);
  $('dataStatus').textContent = 'Error loading data';
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:12px;background:#C45C3A;color:white">No se pudieron cargar los JSON. Abre el dashboard con un servidor local, no como archivo directo.</div>`);
});
