import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import {
  FormSection,
  NumericInput,
  ToggleGroup,
  BooleanToggle,
  InfoCard,
} from '../components/FormField';
import { validateParams, calculatePrimaryRisk, calculateAllGroupRisks,
  resolveGroup, calculateRiskFactorContributions, generateRecommendations,
  classifyRisk } from '../utils/ascvdCalculator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const RACE_OPTIONS = [
  { label: 'White', value: 'white' },
  { label: 'Black / AA', value: 'aa' },
  { label: 'Hispanic', value: 'hispanic' },
  { label: 'Asian / Other', value: 'other' },
];

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export default function InputScreen({ navigation }) {
  // Demographics
  const [age, setAge]   = useState('');
  const [race, setRace] = useState('');
  const [sex, setSex]   = useState('');

  // Lipids
  const [totalCholesterol, setTotalCholesterol] = useState('');
  const [hdlCholesterol, setHdlCholesterol]     = useState('');

  // Blood Pressure
  const [systolicBP, setSystolicBP]   = useState('');
  const [onBPMeds, setOnBPMeds]       = useState(false);

  // Medical History
  const [smoker, setSmoker]     = useState(false);
  const [diabetic, setDiabetic] = useState(false);

  // Advanced markers (optional)
  const [hsCRP, setHsCRP]   = useState('');
  const [lpa, setLpa]       = useState('');
  const [cac, setCac]       = useState('');
  const [bmi, setBmi]       = useState('');

  // Field errors
  const [errors, setErrors] = useState({});

  // Info modal
  const [infoVisible, setInfoVisible] = useState(false);

  const getNumeric = (str) => (str.trim() === '' ? null : parseFloat(str));

  const buildParams = useCallback(() => ({
    age:              getNumeric(age),
    race,
    sex,
    totalCholesterol: getNumeric(totalCholesterol),
    hdlCholesterol:   getNumeric(hdlCholesterol),
    systolicBP:       getNumeric(systolicBP),
    onBPMeds,
    smoker,
    diabetic,
    hsCRP:            getNumeric(hsCRP),
    lpa:              getNumeric(lpa),
    cac:              getNumeric(cac),
    bmi:              getNumeric(bmi),
  }), [age, race, sex, totalCholesterol, hdlCholesterol, systolicBP,
       onBPMeds, smoker, diabetic, hsCRP, lpa, cac, bmi]);

  const fieldError = (field) => errors[field] || null;

  const handleCalculate = useCallback(() => {
    const params = buildParams();
    const { valid, errors: validationErrors } = validateParams(params);

    if (!valid) {
      // Map generic error messages to specific fields
      const fieldErrors = {};
      validationErrors.forEach((msg) => {
        if (msg.includes('Age'))         fieldErrors.age = msg;
        if (msg.includes('cholesterol') && msg.includes('Total')) fieldErrors.totalCholesterol = msg;
        if (msg.includes('HDL'))         fieldErrors.hdlCholesterol = msg;
        if (msg.includes('Systolic'))    fieldErrors.systolicBP = msg;
        if (msg.includes('Race'))        fieldErrors.race = msg;
        if (msg.includes('sex'))         fieldErrors.sex = msg;
      });
      setErrors(fieldErrors);

      Alert.alert(
        'Missing or Invalid Data',
        validationErrors.join('\n\n'),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setErrors({});

    const group         = resolveGroup(params.race, params.sex);
    const primaryRisk   = calculatePrimaryRisk(params);
    const allRisks      = calculateAllGroupRisks(params);
    const contributions = calculateRiskFactorContributions(group, params);
    const riskClass     = classifyRisk(primaryRisk);
    const recommendations = generateRecommendations(params, primaryRisk, contributions);

    navigation.navigate('Results', {
      params,
      group,
      primaryRisk,
      allRisks,
      contributions,
      riskClass,
      recommendations,
    });
  }, [buildParams, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setInfoVisible(true)}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.infoButtonText}>ℹ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ASCVD Risk Calculator</Text>
        <Text style={styles.headerSubtitle}>
          ACC/AHA Pooled Cohort Equations — Goff 2014
        </Text>
      </View>

      {/* About Modal */}
      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalAppName}>ASCVD Risk Calculator</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalVersion}>Version 1.0</Text>
            <Text style={styles.modalAuthor}>
              Ahmed N Mahmoud MD, FACC
            </Text>
            <Text style={styles.modalYear}>© 2026</Text>
            <Text style={styles.modalCredit}>
              Developed with the aid of Claude Code
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setInfoVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Demographics */}
        <FormSection
          title="Demographics"
          subtitle="Required for PCE calculation"
        >
          <NumericInput
            label="Age"
            value={age}
            onChangeText={setAge}
            unit="years"
            min={40}
            max={79}
            hint="40–79 yrs"
            error={fieldError('age')}
          />

          <ToggleGroup
            label="Biological Sex"
            options={SEX_OPTIONS}
            value={sex}
            onSelect={setSex}
          />
          {fieldError('sex') ? (
            <Text style={styles.fieldError}>{fieldError('sex')}</Text>
          ) : null}

          <ToggleGroup
            label="Race / Ethnicity"
            options={RACE_OPTIONS}
            value={race}
            onSelect={setRace}
          />
          {fieldError('race') ? (
            <Text style={styles.fieldError}>{fieldError('race')}</Text>
          ) : null}

          <InfoCard
            text="Equations validated in White and African-American populations. For Hispanic or Asian patients, white race equations are used per ACC/AHA guidelines — results may underestimate true risk."
          />
        </FormSection>

        {/* Lipid Panel */}
        <FormSection
          title="Lipid Panel"
          subtitle="Non-fasting acceptable"
        >
          <NumericInput
            label="Total Cholesterol"
            value={totalCholesterol}
            onChangeText={setTotalCholesterol}
            unit="mg/dL"
            min={130}
            max={320}
            hint="130–320"
            error={fieldError('totalCholesterol')}
          />
          <NumericInput
            label="HDL Cholesterol"
            value={hdlCholesterol}
            onChangeText={setHdlCholesterol}
            unit="mg/dL"
            min={20}
            max={100}
            hint="20–100"
            error={fieldError('hdlCholesterol')}
          />
          <InfoCard
            text="LDL-C is not directly used in the PCE formula — only total cholesterol and HDL-C are required."
          />
        </FormSection>

        {/* Blood Pressure */}
        <FormSection
          title="Blood Pressure"
          subtitle="Average of 2+ readings"
        >
          <NumericInput
            label="Systolic Blood Pressure"
            value={systolicBP}
            onChangeText={setSystolicBP}
            unit="mmHg"
            min={90}
            max={200}
            hint="90–200"
            error={fieldError('systolicBP')}
          />
          <BooleanToggle
            label="On Antihypertensive Medication?"
            value={onBPMeds}
            onChange={setOnBPMeds}
            hint="Affects PCE calculation"
          />
        </FormSection>

        {/* Medical History */}
        <FormSection
          title="Medical History"
        >
          <BooleanToggle
            label="Current Smoker"
            value={smoker}
            onChange={setSmoker}
            hint="Cigarettes, cigars, pipes"
            trueLabel="Yes — Current"
            falseLabel="No / Former"
          />
          <BooleanToggle
            label="Diabetes Mellitus"
            value={diabetic}
            onChange={setDiabetic}
            hint="Type 1 or Type 2"
          />
          <InfoCard
            text="The PCE is for primary prevention — not for patients with established ASCVD (prior MI, stroke, PCI/CABG, angina). Those patients are already high-risk by definition."
          />
        </FormSection>

        {/* Advanced Markers */}
        <FormSection
          title="Advanced Risk Markers"
          subtitle="Optional — aids risk reclassification"
        >
          <NumericInput
            label="hs-CRP"
            value={hsCRP}
            onChangeText={setHsCRP}
            unit="mg/L"
            hint="≥2.0 = elevated"
          />
          <NumericInput
            label="Lipoprotein(a) — Lp(a)"
            value={lpa}
            onChangeText={setLpa}
            unit="nmol/L"
            hint="≥125 = high risk"
          />
          <NumericInput
            label="Coronary Artery Calcium (CAC)"
            value={cac}
            onChangeText={setCac}
            unit="Agatston"
            hint="0 = very low risk"
          />
          <NumericInput
            label="BMI"
            value={bmi}
            onChangeText={setBmi}
            unit="kg/m²"
            hint="≥27 = SELECT eligible"
          />
          <InfoCard
            text="Advanced markers are not used in the PCE formula itself, but guide shared decision-making for statin therapy in borderline-risk patients and inform personalized recommendations."
          />
        </FormSection>

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calcButton}
          onPress={handleCalculate}
          activeOpacity={0.85}
        >
          <Text style={styles.calcButtonText}>Calculate 10-Year Risk →</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          For clinical decision support only. Not a substitute for individualized medical judgment.
          ACC/AHA Pooled Cohort Equations (Goff 2014).
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 52,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOW.medium,
  },
  infoButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 50,
    left: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    letterSpacing: 0.4,
    paddingLeft: 36,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FONTS.sizes.sm,
    marginTop: 3,
    letterSpacing: 0.2,
    paddingLeft: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '78%',
    alignItems: 'center',
    ...SHADOW.medium,
  },
  modalAppName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalDivider: {
    width: '60%',
    height: 1,
    backgroundColor: COLORS.border || '#E0E0E0',
    marginVertical: SPACING.sm,
  },
  modalVersion: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalAuthor: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalYear: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  modalCredit: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  modalCloseBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  fieldError: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    marginTop: -SPACING.xs,
  },
  calcButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.medium,
  },
  calcButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SPACING.sm,
  },
});
