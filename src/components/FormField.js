import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export function FormSection({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function NumericInput({ label, value, onChangeText, unit, min, max, hint, error }) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={min && max ? `${min}–${max}` : ''}
          placeholderTextColor={COLORS.textMuted}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function ToggleGroup({ label, options, value, onSelect, hint }) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={styles.toggleRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.toggleBtn, selected ? styles.toggleSelected : null]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, selected ? styles.toggleTextSelected : null]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function BooleanToggle({ label, value, onChange, hint, trueLabel = 'Yes', falseLabel = 'No' }) {
  return (
    <ToggleGroup
      label={label}
      hint={hint}
      value={value ? 'yes' : 'no'}
      onSelect={(v) => onChange(v === 'yes')}
      options={[
        { label: trueLabel, value: 'yes' },
        { label: falseLabel, value: 'no' },
      ]}
    />
  );
}

export function InfoCard({ text }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>ℹ</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  sectionBody: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  fieldContainer: {
    gap: SPACING.xs + 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
  },
  unit: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
  },
  toggleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  toggleTextSelected: {
    color: COLORS.white,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eaf4fb',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primaryLight,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.xs + 1,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});
