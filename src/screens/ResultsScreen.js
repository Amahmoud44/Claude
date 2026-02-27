import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

// ─── Risk Gauge ──────────────────────────────────────────────────────────────

function RiskGauge({ risk, riskClass }) {
  const pct = Math.min(risk, 100);
  const barWidth = `${Math.min(pct * 4, 100)}%`; // scale so 25%→100% bar

  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.scoreRow}>
        <Text style={[gaugeStyles.score, { color: riskClass.color }]}>
          {pct.toFixed(1)}%
        </Text>
        <View style={[gaugeStyles.badge, { backgroundColor: riskClass.bgColor, borderColor: riskClass.borderColor }]}>
          <Text style={[gaugeStyles.badgeText, { color: riskClass.color }]}>
            {riskClass.category} Risk
          </Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={gaugeStyles.track}>
        {/* Segments */}
        <View style={[gaugeStyles.seg, { flex: 5, backgroundColor: '#27ae60' }]} />
        <View style={[gaugeStyles.seg, { flex: 2.5, backgroundColor: '#f39c12' }]} />
        <View style={[gaugeStyles.seg, { flex: 12.5, backgroundColor: '#e67e22' }]} />
        <View style={[gaugeStyles.seg, { flex: 80, backgroundColor: '#e74c3c' }]} />
      </View>

      {/* Indicator */}
      <View style={gaugeStyles.indicatorRow}>
        <View
          style={[
            gaugeStyles.indicator,
            { marginLeft: `${Math.min(pct * 4, 98)}%` },
          ]}
        />
      </View>

      <View style={gaugeStyles.labels}>
        <Text style={gaugeStyles.labelText}>0%</Text>
        <Text style={gaugeStyles.labelText}>5%</Text>
        <Text style={gaugeStyles.labelText}>7.5%</Text>
        <Text style={gaugeStyles.labelText}>20%</Text>
        <Text style={gaugeStyles.labelText}>25%+</Text>
      </View>

      <Text style={gaugeStyles.description}>{riskClass.description}</Text>
      <View style={[gaugeStyles.recBox, { backgroundColor: riskClass.bgColor, borderColor: riskClass.borderColor }]}>
        <Text style={[gaugeStyles.recText, { color: riskClass.color }]}>
          {riskClass.recommendation}
        </Text>
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.medium,
    marginBottom: SPACING.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  score: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
  },
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 2,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
  },
  badgeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  track: {
    height: 14,
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    gap: 2,
  },
  seg: {
    height: 14,
    borderRadius: 2,
  },
  indicatorRow: {
    height: 12,
    position: 'relative',
  },
  indicator: {
    width: 3,
    height: 12,
    backgroundColor: COLORS.text,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  labelText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  recBox: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
  },
  recText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
});

// ─── Cross-Group Comparison ───────────────────────────────────────────────────

function CrossGroupCard({ allRisks, activeGroup }) {
  const groups = [
    { key: 'whiteMale',   label: 'White Male' },
    { key: 'whiteFemale', label: 'White Female' },
    { key: 'aaMale',      label: 'Black Male' },
    { key: 'aaFemale',    label: 'Black Female' },
  ];

  const maxRisk = Math.max(...Object.values(allRisks), 1);

  return (
    <View style={cgStyles.card}>
      <Text style={cgStyles.title}>Cross-Group Comparison</Text>
      <Text style={cgStyles.subtitle}>
        Same clinical values across all 4 PCE race-sex equations
      </Text>
      {groups.map(({ key, label }) => {
        const val  = allRisks[key];
        const barW = (val / maxRisk) * 100;
        const cls  = val < 5 ? '#27ae60' : val < 7.5 ? '#f39c12' : val < 20 ? '#e67e22' : '#e74c3c';
        const isActive = key === activeGroup;

        return (
          <View key={key} style={cgStyles.row}>
            <Text style={[cgStyles.groupLabel, isActive && cgStyles.groupLabelActive]}>
              {label}{isActive ? ' ★' : ''}
            </Text>
            <View style={cgStyles.barTrack}>
              <View style={[cgStyles.bar, { width: `${barW}%`, backgroundColor: cls }]} />
            </View>
            <Text style={[cgStyles.val, { color: cls }]}>{val.toFixed(1)}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const cgStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.small,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: -SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupLabel: {
    width: 90,
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  groupLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  bar: {
    height: 10,
    borderRadius: RADIUS.full,
  },
  val: {
    width: 40,
    textAlign: 'right',
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
});

// ─── Risk Factor Analysis ─────────────────────────────────────────────────────

function RiskFactorCard({ contributions, params }) {
  const factors = [
    {
      key: 'bloodPressure',
      label: 'Blood Pressure',
      value: contributions.bloodPressure,
      detail: `SBP ${params.systolicBP} mmHg${params.onBPMeds ? ' (treated)' : ''}`,
      icon: '♥',
    },
    {
      key: 'cholesterol',
      label: 'Total Cholesterol',
      value: contributions.cholesterol,
      detail: `${params.totalCholesterol} mg/dL (optimal: 170)`,
      icon: '⬡',
    },
    {
      key: 'hdl',
      label: 'HDL Cholesterol',
      value: contributions.hdl,
      detail: `${params.hdlCholesterol} mg/dL (optimal: ≥55)`,
      icon: '⬡',
      protective: contributions.hdl < 0,
    },
    {
      key: 'smoking',
      label: 'Smoking',
      value: contributions.smoking,
      detail: params.smoker ? 'Current smoker' : 'Non-smoker',
      icon: '🚫',
    },
    {
      key: 'diabetes',
      label: 'Diabetes',
      value: contributions.diabetes,
      detail: params.diabetic ? 'Diabetes present' : 'No diabetes',
      icon: '💧',
    },
  ].filter((f) => f.value > 0);

  const maxContrib = Math.max(...factors.map((f) => Math.abs(f.value)), 0.1);

  return (
    <View style={rfStyles.card}>
      <Text style={rfStyles.title}>Risk Factor Contributions</Text>
      <Text style={rfStyles.subtitle}>
        Percentage points added to your {contributions.base.toFixed(1)}% risk if each factor
        were at optimal level, it would decrease your risk by:
      </Text>

      {factors.length === 0 ? (
        <Text style={rfStyles.optimal}>
          All modifiable risk factors are at optimal levels. Your residual risk is age-related.
        </Text>
      ) : (
        factors.map((f) => {
          const barW = (Math.abs(f.value) / maxContrib) * 100;
          const color = f.protective ? COLORS.success : COLORS.danger;
          return (
            <View key={f.key} style={rfStyles.row}>
              <View style={rfStyles.labelCol}>
                <Text style={rfStyles.factorLabel}>{f.label}</Text>
                <Text style={rfStyles.factorDetail}>{f.detail}</Text>
              </View>
              <View style={rfStyles.barArea}>
                <View style={rfStyles.barTrack}>
                  <View style={[rfStyles.bar, { width: `${barW}%`, backgroundColor: color }]} />
                </View>
                <Text style={[rfStyles.contrib, { color }]}>
                  {f.value > 0 ? '+' : ''}{f.value}%
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={rfStyles.optimalRow}>
        <Text style={rfStyles.optimalLabel}>Optimal risk (age only):</Text>
        <Text style={rfStyles.optimalVal}>{contributions.optimal}%</Text>
      </View>
    </View>
  );
}

const rfStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.small,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  optimal: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  labelCol: {
    width: 110,
  },
  factorLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  factorDetail: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  barArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  bar: {
    height: 10,
    borderRadius: RADIUS.full,
  },
  contrib: {
    width: 38,
    textAlign: 'right',
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  optimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  optimalLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  optimalVal: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.success,
  },
});

// ─── Advanced Markers Panel ───────────────────────────────────────────────────

function AdvancedMarkersCard({ params }) {
  const { hsCRP, lpa, cac } = params;
  if (!hsCRP && !lpa && !cac) return null;

  const markers = [];

  if (hsCRP != null) {
    const elevated = hsCRP >= 2.0;
    markers.push({
      name: 'hs-CRP',
      value: `${hsCRP} mg/L`,
      status: elevated ? 'Elevated (≥2.0 mg/L)' : 'Normal (<2.0 mg/L)',
      color: elevated ? COLORS.warning : COLORS.success,
      implication: elevated
        ? 'Favors statin initiation in borderline patients (JUPITER trial). Associated with ~2× CV event rate.'
        : 'Low systemic inflammation. Consider deferring statin if 10-year risk is borderline.',
    });
  }

  if (lpa != null) {
    const high = lpa >= 125;
    markers.push({
      name: 'Lp(a)',
      value: `${lpa} nmol/L`,
      status: high ? 'High Risk (≥125 nmol/L)' : 'Lower Risk (<125 nmol/L)',
      color: high ? COLORS.danger : COLORS.success,
      implication: high
        ? 'Lp(a) ≥125 nmol/L is a risk-enhancing factor per ACC/AHA 2018. Genetic condition unresponsive to statins. Consider PCSK9i, evolocumab (↓Lp(a) ~20-25%).'
        : 'Lp(a) does not substantially increase risk above PCE estimate.',
    });
  }

  if (cac != null) {
    let status, color, implication;
    if (cac === 0) {
      status = 'CAC = 0 (Very Low Risk)';
      color  = COLORS.success;
      implication =
        'CAC = 0 is a powerful negative risk marker (MESA study). Supports withholding statin in borderline-risk patients. However, risk may return to elevated within 5–7 years — reassess.';
    } else if (cac < 100) {
      status = `CAC ${cac} (Mild Calcification)`;
      color  = COLORS.warning;
      implication =
        'Subclinical atherosclerosis present. Supports statin initiation in borderline (5–7.4%) risk patients. Moderate-intensity statin preferred.';
    } else {
      status = `CAC ${cac} (Significant Calcification)`;
      color  = COLORS.danger;
      implication =
        'CAC ≥100 reclassifies to high-risk category regardless of PCE score. High-intensity statin strongly recommended. CAC ≥300 or ≥75th percentile confers the highest risk.';
    }
    markers.push({ name: 'CAC Score', value: `${cac} Agatston`, status, color, implication });
  }

  return (
    <View style={amStyles.card}>
      <Text style={amStyles.title}>Advanced Risk Markers</Text>
      {markers.map((m, i) => (
        <View key={i} style={amStyles.marker}>
          <View style={amStyles.markerHeader}>
            <Text style={amStyles.markerName}>{m.name}</Text>
            <Text style={amStyles.markerValue}>{m.value}</Text>
          </View>
          <View style={[amStyles.statusChip, { backgroundColor: m.color + '20', borderColor: m.color }]}>
            <Text style={[amStyles.statusText, { color: m.color }]}>{m.status}</Text>
          </View>
          <Text style={amStyles.implication}>{m.implication}</Text>
        </View>
      ))}
    </View>
  );
}

const amStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.small,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  marker: {
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.sm,
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  markerValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: FONTS.sizes.xs + 1,
    fontWeight: '700',
  },
  implication: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

// ─── Prevention Plan ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { color: COLORS.danger,  label: 'High Priority',   bg: '#fdedec' },
  medium: { color: COLORS.warning, label: 'Medium Priority', bg: '#fef9e7' },
  low:    { color: COLORS.success, label: 'Lower Priority',  bg: '#eafaf1' },
};

function PreventionPlan({ recommendations }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={ppStyles.container}>
      <Text style={ppStyles.sectionTitle}>Evidence-Based Prevention Plan</Text>
      <Text style={ppStyles.sectionSubtitle}>
        Personalized recommendations with trial citations
      </Text>
      {recommendations.map((rec, i) => {
        const pc      = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low;
        const isOpen  = expanded === i;
        return (
          <TouchableOpacity
            key={i}
            style={[ppStyles.card, { borderLeftColor: pc.color }]}
            onPress={() => setExpanded(isOpen ? null : i)}
            activeOpacity={0.85}
          >
            <View style={ppStyles.cardHeader}>
              <View style={ppStyles.cardTitleArea}>
                <View style={[ppStyles.priorityChip, { backgroundColor: pc.bg, borderColor: pc.color }]}>
                  <Text style={[ppStyles.priorityText, { color: pc.color }]}>{pc.label}</Text>
                </View>
                <Text style={ppStyles.category}>{rec.category}</Text>
                <Text style={ppStyles.title}>{rec.title}</Text>
              </View>
              <Text style={ppStyles.chevron}>{isOpen ? '▲' : '▼'}</Text>
            </View>

            {isOpen && (
              <View style={ppStyles.cardBody}>
                <Text style={ppStyles.body}>{rec.body}</Text>
                <View style={ppStyles.evidencePill}>
                  <Text style={ppStyles.evidenceLabel}>📄 Evidence: </Text>
                  <Text style={ppStyles.evidenceText}>{rec.evidence}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ppStyles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.md,
    ...SHADOW.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitleArea: {
    flex: 1,
    gap: 4,
  },
  priorityChip: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  priorityText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  category: {
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  chevron: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    marginTop: 2,
  },
  cardBody: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  body: {
    fontSize: FONTS.sizes.sm + 1,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  evidencePill: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#eaf4fb',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: 2,
  },
  evidenceLabel: {
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.primary,
    fontWeight: '700',
  },
  evidenceText: {
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.primaryLight,
    lineHeight: 18,
    flex: 1,
  },
});

// ─── Patient Summary Header ───────────────────────────────────────────────────

function PatientSummary({ params }) {
  const raceLabel = { white: 'White', aa: 'Black/AA', hispanic: 'Hispanic', other: 'Asian/Other' };
  const sexLabel  = { male: 'Male', female: 'Female' };

  const items = [
    { label: 'Age',    value: `${params.age} yrs` },
    { label: 'Sex',    value: sexLabel[params.sex] || params.sex },
    { label: 'Race',   value: raceLabel[params.race] || params.race },
    { label: 'TC',     value: `${params.totalCholesterol} mg/dL` },
    { label: 'HDL-C',  value: `${params.hdlCholesterol} mg/dL` },
    { label: 'SBP',    value: `${params.systolicBP} mmHg${params.onBPMeds ? '*' : ''}` },
    { label: 'Smoker', value: params.smoker   ? 'Yes' : 'No' },
    { label: 'DM',     value: params.diabetic ? 'Yes' : 'No' },
  ];

  return (
    <View style={psStyles.card}>
      <Text style={psStyles.title}>Patient Summary</Text>
      <View style={psStyles.grid}>
        {items.map((item) => (
          <View key={item.label} style={psStyles.cell}>
            <Text style={psStyles.cellLabel}>{item.label}</Text>
            <Text style={psStyles.cellValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      {params.onBPMeds && (
        <Text style={psStyles.note}>* On antihypertensive therapy</Text>
      )}
    </View>
  );
}

const psStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.medium,
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  cell: {
    width: '23%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs + 2,
  },
  cellLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  cellValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  note: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xs,
  },
});

// ─── Main Results Screen ──────────────────────────────────────────────────────

export default function ResultsScreen({ navigation, route }) {
  const {
    params,
    group,
    primaryRisk,
    allRisks,
    contributions,
    riskClass,
    recommendations,
  } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>← Recalculate</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>10-Year ASCVD Risk</Text>
        <Text style={styles.headerSubtitle}>
          ACC/AHA Pooled Cohort Equations · Goff 2014
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient summary */}
        <PatientSummary params={params} />

        {/* Primary risk gauge */}
        <RiskGauge risk={primaryRisk} riskClass={riskClass} />

        {/* Cross-group comparison */}
        <CrossGroupCard allRisks={allRisks} activeGroup={group} />

        {/* Risk factor contributions */}
        <RiskFactorCard contributions={contributions} params={params} />

        {/* Advanced markers */}
        <AdvancedMarkersCard params={params} />

        {/* Prevention plan */}
        <PreventionPlan recommendations={recommendations} />

        {/* Reference */}
        <View style={styles.refCard}>
          <Text style={styles.refTitle}>Key Trial References</Text>
          <Text style={styles.refText}>
            {'• '}
            <Text style={styles.refBold}>SPRINT (2015):</Text>
            {' Intensive SBP control (<120 mmHg) → 25% ↓ MACE, 27% ↓ mortality. NEJM 373:2103.\n'}
            {'• '}
            <Text style={styles.refBold}>PREDIMED (2013):</Text>
            {' Mediterranean diet → 30% ↓ MACE. NEJM 368:1279.\n'}
            {'• '}
            <Text style={styles.refBold}>EMPA-REG (2015):</Text>
            {' Empagliflozin → 14% ↓ MACE, 38% ↓ CV death in T2DM. NEJM 373:2117.\n'}
            {'• '}
            <Text style={styles.refBold}>SELECT (2023):</Text>
            {' Semaglutide → 20% ↓ MACE in obesity without DM. NEJM 389:2221.\n'}
            {'• '}
            <Text style={styles.refBold}>Goff DC Jr et al (2014):</Text>
            {' Pooled Cohort Equations. JACC 63(25):2935-59.'}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          ASCVD risk estimates are population-based and should inform, not replace, shared
          clinical decision-making. Equations validated for ages 40–79 without established ASCVD.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 52,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOW.medium,
  },
  backBtn: {
    marginBottom: SPACING.xs,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.sizes.xs + 1,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  refCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.small,
    gap: SPACING.sm,
  },
  refTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  refText: {
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  refBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  disclaimer: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SPACING.sm,
  },
});
