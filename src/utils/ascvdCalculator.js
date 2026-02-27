/**
 * ACC/AHA 2013 Pooled Cohort Equations for 10-Year ASCVD Risk
 * Based on: Goff DC Jr, et al. 2013 ACC/AHA Guideline on the Assessment of
 * Cardiovascular Risk. J Am Coll Cardiol. 2014;63(25 Pt B):2935-59.
 *
 * Full Table A coefficients including all interaction terms.
 *
 * Validated against clinical vignette (age 55, TC 213, HDL 50, SBP 120 untreated,
 * non-smoker, no DM): White male 5.38%, White female 2.05%, AA male 6.07%, AA female 3.03%
 */

/**
 * Coefficients for each race-sex group from Table A (Goff 2014)
 *
 * Note on AA Female: The 4.475 coefficient is for ln(Age) × ln(HDL-C),
 * consistent with the original Goff 2014 Table A specification.
 */
const COEFFICIENTS = {
  whiteMale: {
    lnAge:                   12.344,
    lnAge2:                  0,
    lnTC:                    11.853,
    lnAgeLnTC:               -2.664,
    lnHDL:                   -7.990,
    lnAgeLnHDL:              1.769,
    lnTreatedSBP:            1.797,
    lnAgeLnTreatedSBP:       0,
    lnUntreatedSBP:          1.764,
    lnAgeLnUntreatedSBP:     0,
    smoking:                 7.837,
    lnAgeSmoking:            -1.795,
    dm:                      0.658,
    mean:                    61.18,
    s0:                      0.9144,
  },

  whiteFemale: {
    lnAge:                   -29.799,
    lnAge2:                  4.884,
    lnTC:                    13.540,
    lnAgeLnTC:               -3.114,
    lnHDL:                   -13.578,
    lnAgeLnHDL:              3.149,
    lnTreatedSBP:            2.019,
    lnAgeLnTreatedSBP:       0,
    lnUntreatedSBP:          1.957,
    lnAgeLnUntreatedSBP:     0,
    smoking:                 7.574,
    lnAgeSmoking:            -1.665,
    dm:                      0.661,
    mean:                    -29.18,
    s0:                      0.9665,
  },

  aaMale: {
    lnAge:                   2.469,
    lnAge2:                  0,
    lnTC:                    0.302,
    lnAgeLnTC:               0,
    lnHDL:                   -0.307,
    lnAgeLnHDL:              0,
    lnTreatedSBP:            1.916,
    lnAgeLnTreatedSBP:       0,
    lnUntreatedSBP:          1.809,
    lnAgeLnUntreatedSBP:     0,
    smoking:                 0.549,
    lnAgeSmoking:            0,
    dm:                      0.645,
    mean:                    19.54,
    s0:                      0.8954,
  },

  // Per Goff 2014 Table A: 4.475 is the coefficient for ln(Age) × ln(HDL-C)
  aaFemale: {
    lnAge:                   17.114,
    lnAge2:                  0,
    lnTC:                    0.940,
    lnAgeLnTC:               0,
    lnHDL:                   -18.920,
    lnAgeLnHDL:              4.475,
    lnTreatedSBP:            29.291,
    lnAgeLnTreatedSBP:       -6.432,
    lnUntreatedSBP:          27.820,
    lnAgeLnUntreatedSBP:     -6.087,
    smoking:                 0.691,
    lnAgeSmoking:            0,
    dm:                      0.874,
    mean:                    86.61,
    s0:                      0.9533,
  },
};

/**
 * Calculate the individual sum of coefficients × risk factor values.
 *
 * @param {string} group  - 'whiteMale' | 'whiteFemale' | 'aaMale' | 'aaFemale'
 * @param {object} params - Clinical parameters
 * @returns {number} Individual sum
 */
function calculateIndividualSum(group, params) {
  const c = COEFFICIENTS[group];
  const { age, totalCholesterol, hdlCholesterol, systolicBP, onBPMeds, smoker, diabetic } = params;

  const lnAge  = Math.log(age);
  const lnTC   = Math.log(totalCholesterol);
  const lnHDL  = Math.log(hdlCholesterol);
  const lnSBP  = Math.log(systolicBP);
  const smoke  = smoker   ? 1 : 0;
  const dmBin  = diabetic ? 1 : 0;

  let sum = 0;

  sum += c.lnAge * lnAge;

  if (c.lnAge2)    sum += c.lnAge2 * lnAge * lnAge;
  sum += c.lnTC * lnTC;
  if (c.lnAgeLnTC) sum += c.lnAgeLnTC * lnAge * lnTC;

  sum += c.lnHDL * lnHDL;
  if (c.lnAgeLnHDL) sum += c.lnAgeLnHDL * lnAge * lnHDL;

  if (onBPMeds) {
    sum += c.lnTreatedSBP * lnSBP;
    if (c.lnAgeLnTreatedSBP) sum += c.lnAgeLnTreatedSBP * lnAge * lnSBP;
  } else {
    sum += c.lnUntreatedSBP * lnSBP;
    if (c.lnAgeLnUntreatedSBP) sum += c.lnAgeLnUntreatedSBP * lnAge * lnSBP;
  }

  sum += c.smoking * smoke;
  if (c.lnAgeSmoking) sum += c.lnAgeSmoking * lnAge * smoke;

  sum += c.dm * dmBin;

  return sum;
}

/**
 * Calculate 10-year ASCVD risk for a given race-sex group.
 * Formula: risk = 1 - S0^exp(individualSum - mean)
 *
 * @param {string} group
 * @param {object} params
 * @returns {number} Risk as decimal (0–1)
 */
function calculateGroupRisk(group, params) {
  const c = COEFFICIENTS[group];
  const individualSum = calculateIndividualSum(group, params);
  const risk = 1 - Math.pow(c.s0, Math.exp(individualSum - c.mean));
  return Math.max(0, Math.min(1, risk));
}

/**
 * Calculate 10-year ASCVD risk for all four race-sex groups.
 *
 * @param {object} params - Clinical parameters
 * @returns {object} { whiteMale, whiteFemale, aaMale, aaFemale } as percentages
 */
export function calculateAllGroupRisks(params) {
  return {
    whiteMale:   +(calculateGroupRisk('whiteMale',   params) * 100).toFixed(2),
    whiteFemale: +(calculateGroupRisk('whiteFemale', params) * 100).toFixed(2),
    aaMale:      +(calculateGroupRisk('aaMale',      params) * 100).toFixed(2),
    aaFemale:    +(calculateGroupRisk('aaFemale',    params) * 100).toFixed(2),
  };
}

/**
 * Get the primary risk for the patient's own race-sex group.
 *
 * @param {object} params - Clinical parameters including race and sex
 * @returns {number} Risk percentage (2 decimal places)
 */
export function calculatePrimaryRisk(params) {
  const group = resolveGroup(params.race, params.sex);
  return +(calculateGroupRisk(group, params) * 100).toFixed(2);
}

/**
 * Resolve the race-sex group key.
 * For races other than white/AA, guidelines recommend using white equations.
 */
export function resolveGroup(race, sex) {
  if (race === 'white' && sex === 'male')        return 'whiteMale';
  if (race === 'white' && sex === 'female')      return 'whiteFemale';
  if (race === 'aa' && sex === 'male')           return 'aaMale';
  if (race === 'aa' && sex === 'female')         return 'aaFemale';
  // Other races: use white equations per ACC/AHA guidance
  return sex === 'male' ? 'whiteMale' : 'whiteFemale';
}

/**
 * Classify 10-year risk per ACC/AHA 2018/2019 categories.
 *   Low:          < 5%
 *   Borderline:   5–7.4%
 *   Intermediate: 7.5–19.9%
 *   High:         ≥ 20%
 */
export function classifyRisk(riskPercent) {
  if (riskPercent < 5) {
    return {
      category: 'Low',
      color: '#27ae60',
      bgColor: '#eafaf1',
      borderColor: '#2ecc71',
      description:
        'Less than 5% chance of a cardiovascular event over the next 10 years.',
      recommendation:
        'Emphasize heart-healthy lifestyle. Statin therapy may not be required unless risk-enhancing factors are present.',
    };
  } else if (riskPercent < 7.5) {
    return {
      category: 'Borderline',
      color: '#d4ac0d',
      bgColor: '#fef9e7',
      borderColor: '#f39c12',
      description:
        '5–7.4% chance. Risk-enhancing factors should guide shared decision-making.',
      recommendation:
        'Discuss risk-enhancing factors (hs-CRP, Lp(a), CAC). Moderate-intensity statin may be considered.',
    };
  } else if (riskPercent < 20) {
    return {
      category: 'Intermediate',
      color: '#e67e22',
      bgColor: '#fef0e7',
      borderColor: '#e67e22',
      description:
        '7.5–19.9% chance. Statin therapy is generally recommended (ACC/AHA 2018).',
      recommendation:
        'Initiate moderate-to-high intensity statin. Address modifiable risk factors aggressively.',
    };
  } else {
    return {
      category: 'High',
      color: '#c0392b',
      bgColor: '#fdedec',
      borderColor: '#e74c3c',
      description:
        '≥20% chance. Equivalent to established cardiovascular disease risk.',
      recommendation:
        'High-intensity statin therapy strongly recommended. Consider additional agents (ezetimibe, PCSK9i). Aggressive lifestyle modification.',
    };
  }
}

/**
 * Calculate risk factor contributions — how much each factor adds to risk.
 * Computed as risk reduction if that factor were at "optimal" level.
 *
 * Optimal values: TC 170, HDL 55, SBP 110 untreated, non-smoker, no DM
 *
 * @param {string} group
 * @param {object} params
 * @returns {object} Contributions per factor (percentage points)
 */
export function calculateRiskFactorContributions(group, params) {
  const baseRisk = calculateGroupRisk(group, params) * 100;

  const riskWithout = (overrides) =>
    calculateGroupRisk(group, { ...params, ...overrides }) * 100;

  const smokingContrib = params.smoker
    ? +(baseRisk - riskWithout({ smoker: false })).toFixed(1)
    : 0;

  const dmContrib = params.diabetic
    ? +(baseRisk - riskWithout({ diabetic: false })).toFixed(1)
    : 0;

  const tcContrib = params.totalCholesterol > 170
    ? +(baseRisk - riskWithout({ totalCholesterol: 170 })).toFixed(1)
    : 0;

  const hdlContrib = params.hdlCholesterol < 55
    ? +(baseRisk - riskWithout({ hdlCholesterol: 55 })).toFixed(1)
    : 0;

  const bpContrib = params.systolicBP > 110 || params.onBPMeds
    ? +(baseRisk - riskWithout({ systolicBP: 110, onBPMeds: false })).toFixed(1)
    : 0;

  const optimalRisk = +riskWithout({
    totalCholesterol: 170,
    hdlCholesterol: 55,
    systolicBP: 110,
    onBPMeds: false,
    smoker: false,
    diabetic: false,
  }).toFixed(1);

  return {
    smoking: smokingContrib,
    diabetes: dmContrib,
    cholesterol: tcContrib,
    hdl: hdlContrib,
    bloodPressure: bpContrib,
    optimal: optimalRisk,
    base: +baseRisk.toFixed(1),
  };
}

/**
 * Validate input parameters are within acceptable ranges for the PCE.
 *
 * @param {object} params
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateParams(params) {
  const errors = [];

  if (!params.age || params.age < 40 || params.age > 79) {
    errors.push('Age must be between 40 and 79 years (PCE validated range).');
  }
  if (!params.totalCholesterol || params.totalCholesterol < 130 || params.totalCholesterol > 320) {
    errors.push('Total cholesterol must be between 130 and 320 mg/dL.');
  }
  if (!params.hdlCholesterol || params.hdlCholesterol < 20 || params.hdlCholesterol > 100) {
    errors.push('HDL cholesterol must be between 20 and 100 mg/dL.');
  }
  if (!params.systolicBP || params.systolicBP < 90 || params.systolicBP > 200) {
    errors.push('Systolic BP must be between 90 and 200 mmHg.');
  }
  if (!params.race) {
    errors.push('Race/ethnicity is required.');
  }
  if (!params.sex) {
    errors.push('Biological sex is required.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate evidence-based prevention recommendations.
 * Cites: SPRINT, PREDIMED, EMPA-REG OUTCOME, SELECT trials.
 *
 * @param {object} params - Clinical parameters
 * @param {number} riskPercent - 10-year risk percentage
 * @param {object} contributions - Risk factor contributions
 * @returns {object[]} Array of recommendation objects
 */
export function generateRecommendations(params, riskPercent, contributions) {
  const recs = [];
  const classify = classifyRisk(riskPercent);

  // Statin therapy
  if (riskPercent >= 20) {
    recs.push({
      category: 'Lipid-Lowering Therapy',
      priority: 'high',
      icon: 'medical-bag',
      title: 'High-Intensity Statin Therapy',
      body:
        'High-intensity statin (rosuvastatin 20–40 mg or atorvastatin 40–80 mg) is strongly ' +
        'recommended. If LDL-C remains ≥70 mg/dL on maximally tolerated statin, add ezetimibe; ' +
        'if still ≥70 mg/dL, consider PCSK9 inhibitor.',
      evidence: 'ACC/AHA 2018 Cholesterol Guideline (Class I, Level A)',
    });
  } else if (riskPercent >= 7.5) {
    recs.push({
      category: 'Lipid-Lowering Therapy',
      priority: 'high',
      icon: 'medical-bag',
      title: 'Moderate-to-High Intensity Statin',
      body:
        'Moderate-intensity statin (atorvastatin 10–20 mg, rosuvastatin 5–10 mg) recommended. ' +
        'Escalate to high-intensity if risk-enhancing factors present. Target ≥50% LDL-C reduction.',
      evidence: 'ACC/AHA 2018 Cholesterol Guideline (Class I, Level A)',
    });
  } else if (riskPercent >= 5) {
    recs.push({
      category: 'Lipid-Lowering Therapy',
      priority: 'medium',
      icon: 'medical-bag',
      title: 'Statin Therapy — Shared Decision-Making',
      body:
        'Moderate-intensity statin may be considered after clinician-patient discussion of ' +
        'net benefit, risk-enhancing factors (hs-CRP, Lp(a), CAC), and patient preferences.',
      evidence: 'ACC/AHA 2018 Cholesterol Guideline (Class IIb, Level A)',
    });
  }

  // Blood pressure
  if (params.systolicBP >= 130 || params.onBPMeds) {
    const sprintBody =
      'Target SBP <130 mmHg with lifestyle and pharmacotherapy. ' +
      'The SPRINT trial (2015) demonstrated a 25% relative reduction in major cardiovascular ' +
      'events with intensive BP control (SBP <120 mmHg) vs. standard (SBP <140 mmHg) ' +
      'in non-diabetic adults at high CVD risk (N=9,361; NNT≈61 over 3.26 years).';

    recs.push({
      category: 'Blood Pressure Control',
      priority: params.systolicBP >= 160 ? 'high' : 'medium',
      icon: 'heart-pulse',
      title: 'Blood Pressure Optimization',
      body: sprintBody,
      evidence: 'SPRINT Trial (NEJM 2015; 373:2103-2116); JNC-8; ACC/AHA 2017 HTN Guidelines',
    });
  }

  // Smoking cessation
  if (params.smoker) {
    recs.push({
      category: 'Smoking Cessation',
      priority: 'high',
      icon: 'smoking-off',
      title: 'Smoking Cessation — Highest Priority Intervention',
      body:
        'Smoking cessation is the single most effective preventive intervention available. ' +
        `Eliminates ~${contributions.smoking}% point risk contribution. Combination of ` +
        'varenicline + counseling achieves 3-month abstinence in ~33% vs 9% with placebo. ' +
        'Risk approaches that of a non-smoker within 1–2 years.',
      evidence: 'Cochrane Review 2016; ACC/AHA 2019 Primary Prevention Guideline',
    });
  }

  // Diet (PREDIMED)
  recs.push({
    category: 'Dietary Modification',
    priority: riskPercent >= 7.5 ? 'high' : 'medium',
    icon: 'food-apple',
    title: 'Mediterranean Diet',
    body:
      'The PREDIMED trial (2013, N=7,447) demonstrated a 30% relative risk reduction in ' +
      'major cardiovascular events with Mediterranean diet supplemented with extra-virgin ' +
      'olive oil (HR 0.70, 95% CI 0.54–0.92) vs. low-fat diet in high-risk adults. ' +
      'Emphasize: olive oil, nuts, fish, legumes, vegetables, whole grains. ' +
      'Reduce: red meat, processed foods, refined carbohydrates.',
    evidence: 'PREDIMED Trial (NEJM 2013; 368:1279-1290)',
  });

  // Diabetes-specific (EMPA-REG)
  if (params.diabetic) {
    recs.push({
      category: 'Diabetes Management',
      priority: 'high',
      icon: 'water',
      title: 'SGLT-2 Inhibitor or GLP-1 RA for CV Protection',
      body:
        'The EMPA-REG OUTCOME trial (2015, N=7,020) showed empagliflozin (SGLT-2i) reduced ' +
        '3-point MACE by 14% (HR 0.86, 95% CI 0.74–0.99) and CV death by 38% in T2DM with ' +
        'established CVD. GLP-1 receptor agonists (liraglutide, semaglutide) also demonstrated ' +
        'CV benefit. For T2DM with high CVD risk, SGLT-2i or GLP-1 RA preferred regardless of ' +
        'HbA1c or metformin use (ADA Standards of Care 2024).',
      evidence: 'EMPA-REG OUTCOME (NEJM 2015; 373:2117-2128); ADA Standards 2024',
    });
  }

  // Obesity/GLP-1 (SELECT trial)
  if (params.bmi && params.bmi >= 27) {
    recs.push({
      category: 'Weight Management',
      priority: riskPercent >= 7.5 ? 'high' : 'medium',
      icon: 'run',
      title: 'Weight Reduction — Consider GLP-1 RA',
      body:
        'The SELECT trial (2023, N=17,604) demonstrated semaglutide 2.4 mg weekly reduced ' +
        'major adverse CV events by 20% (HR 0.80, 95% CI 0.72–0.90) in adults with obesity ' +
        '(BMI ≥27) and established CVD but without diabetes. Weight loss of ≥10% improves ' +
        'lipids, BP, glycemia, and systemic inflammation.',
      evidence: 'SELECT Trial (NEJM 2023; 389:2221-2232)',
    });
  } else {
    recs.push({
      category: 'Physical Activity',
      priority: 'medium',
      icon: 'run',
      title: 'Regular Aerobic Exercise',
      body:
        'Achieve ≥150 min/week moderate-intensity aerobic activity (brisk walking, cycling, ' +
        'swimming) or ≥75 min/week vigorous-intensity activity. Reduces SBP by 5–8 mmHg, ' +
        'increases HDL-C by 3–6 mg/dL, and lowers 10-year CVD risk by ~15–20% independently. ' +
        'Add 2 sessions/week resistance training.',
      evidence: 'ACC/AHA 2019 Primary Prevention Guideline (Class I, Level B-NR)',
    });
  }

  // Aspirin
  if (riskPercent >= 10 && params.age < 70) {
    recs.push({
      category: 'Antiplatelet Therapy',
      priority: 'medium',
      icon: 'pill',
      title: 'Low-Dose Aspirin — Individualized Decision',
      body:
        'For adults 40–70 with ≥10% 10-year CVD risk and no increased bleeding risk: ' +
        'low-dose aspirin (75–100 mg/day) may be considered after clinician-patient discussion. ' +
        'USPSTF 2022 recommends against initiating aspirin in adults ≥60 years for primary ' +
        'prevention. Balance CV benefit vs. GI bleeding risk (NNH ~60 over 10 years).',
      evidence: 'USPSTF 2022; ACC/AHA 2019 Primary Prevention Guideline (Class IIb)',
    });
  }

  // Advanced markers follow-up
  recs.push({
    category: 'Advanced Risk Assessment',
    priority: 'low',
    icon: 'test-tube',
    title: 'Risk-Enhancing Biomarkers',
    body:
      'If therapy decision uncertain after PCE calculation, measure risk-enhancing factors: ' +
      '• hs-CRP ≥2.0 mg/L: supports statin initiation\n' +
      '• Lp(a) ≥125 nmol/L (≥50 mg/dL): significantly increases lifetime risk\n' +
      '• Coronary Artery Calcium (CAC) score:\n' +
      '  - CAC = 0: favors withholding statin (NNT very high)\n' +
      '  - CAC 1–99: consider moderate statin\n' +
      '  - CAC ≥100: initiate statin therapy',
    evidence: 'ACC/AHA 2018 Cholesterol Guideline; Multi-Ethnic Study of Atherosclerosis (MESA)',
  });

  return recs;
}

/**
 * Run clinical vignette for validation.
 * Expected: White male ~5.3%, AA male ~6.1%, White female ~2.1%, AA female ~3.0%
 */
export function runValidationVignette() {
  const params = {
    age: 55,
    totalCholesterol: 213,
    hdlCholesterol: 50,
    systolicBP: 120,
    onBPMeds: false,
    smoker: false,
    diabetic: false,
    race: 'white',
    sex: 'male',
  };
  return calculateAllGroupRisks(params);
}
