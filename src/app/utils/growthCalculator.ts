// WHO Growth Standards Calculator
// Reference data points for Weight-for-Length (under 24 months) and BMI-for-Age (24 to 60 months)
// L, M, S parameters from WHO Multicentre Growth Reference Study.

interface LMS {
  L: number;
  M: number;
  S: number;
}

interface GrowthDataPoint {
  key: number; // Length (cm) or Age (months)
  L: number;
  M: number;
  S: number;
}

// Weight-for-length reference data for boys under 24 months (45cm to 110cm)
const WFL_BOYS: GrowthDataPoint[] = [
  { key: 45, L: -0.35, M: 2.45, S: 0.111 },
  { key: 50, L: -0.35, M: 3.30, S: 0.110 },
  { key: 55, L: -0.35, M: 4.30, S: 0.105 },
  { key: 60, L: -0.35, M: 5.70, S: 0.100 },
  { key: 65, L: -0.35, M: 7.10, S: 0.097 },
  { key: 70, L: -0.35, M: 8.40, S: 0.095 },
  { key: 75, L: -0.35, M: 9.60, S: 0.093 },
  { key: 80, L: -0.35, M: 10.70, S: 0.090 },
  { key: 85, L: -0.35, M: 11.80, S: 0.088 },
  { key: 90, L: -0.35, M: 12.90, S: 0.087 },
  { key: 95, L: -0.35, M: 14.10, S: 0.087 },
  { key: 100, L: -0.35, M: 15.40, S: 0.088 },
  { key: 105, L: -0.35, M: 16.90, S: 0.090 },
  { key: 110, L: -0.35, M: 18.50, S: 0.092 }
];

// Weight-for-length reference data for girls under 24 months (45cm to 110cm)
const WFL_GIRLS: GrowthDataPoint[] = [
  { key: 45, L: -0.38, M: 2.30, S: 0.120 },
  { key: 50, L: -0.38, M: 3.20, S: 0.115 },
  { key: 55, L: -0.38, M: 4.20, S: 0.110 },
  { key: 60, L: -0.38, M: 5.40, S: 0.105 },
  { key: 65, L: -0.38, M: 6.70, S: 0.100 },
  { key: 70, L: -0.38, M: 7.90, S: 0.097 },
  { key: 75, L: -0.38, M: 9.10, S: 0.095 },
  { key: 80, L: -0.38, M: 10.20, S: 0.093 },
  { key: 85, L: -0.38, M: 11.20, S: 0.092 },
  { key: 90, L: -0.38, M: 12.30, S: 0.091 },
  { key: 95, L: -0.38, M: 13.50, S: 0.091 },
  { key: 100, L: -0.38, M: 14.80, S: 0.092 },
  { key: 105, L: -0.38, M: 16.20, S: 0.094 },
  { key: 110, L: -0.38, M: 17.80, S: 0.096 }
];

// BMI-for-age reference data for boys 24-60 months
const BMI_BOYS: GrowthDataPoint[] = [
  { key: 24, L: -1.1, M: 16.30, S: 0.075 },
  { key: 30, L: -1.1, M: 16.00, S: 0.075 },
  { key: 36, L: -1.1, M: 15.80, S: 0.076 },
  { key: 42, L: -1.1, M: 15.60, S: 0.077 },
  { key: 48, L: -1.1, M: 15.40, S: 0.078 },
  { key: 54, L: -1.1, M: 15.30, S: 0.079 },
  { key: 60, L: -1.1, M: 15.20, S: 0.080 }
];

// BMI-for-age reference data for girls 24-60 months
const BMI_GIRLS: GrowthDataPoint[] = [
  { key: 24, L: -1.3, M: 16.10, S: 0.080 },
  { key: 30, L: -1.3, M: 15.80, S: 0.080 },
  { key: 36, L: -1.3, M: 15.50, S: 0.081 },
  { key: 42, L: -1.3, M: 15.30, S: 0.082 },
  { key: 48, L: -1.3, M: 15.10, S: 0.083 },
  { key: 54, L: -1.3, M: 15.00, S: 0.084 },
  { key: 60, L: -1.3, M: 14.90, S: 0.085 }
];

// Linear interpolation helper
function interpolate(x: number, data: GrowthDataPoint[]): LMS {
  if (x <= data[0].key) {
    return { L: data[0].L, M: data[0].M, S: data[0].S };
  }
  if (x >= data[data.length - 1].key) {
    return { L: data[data.length - 1].L, M: data[data.length - 1].M, S: data[data.length - 1].S };
  }

  // Find surrounding points
  let i = 0;
  while (i < data.length - 1 && x > data[i + 1].key) {
    i++;
  }

  const p1 = data[i];
  const p2 = data[i + 1];
  const t = (x - p1.key) / (p2.key - p1.key);

  return {
    L: p1.L + t * (p2.L - p1.L),
    M: p1.M + t * (p2.M - p1.M),
    S: p1.S + t * (p2.S - p1.S)
  };
}

// Standard Normal Cumulative Distribution Function (CDF)
// Approximates the percentile from a Z-score
export function zToPercentile(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.39894228 * Math.exp(-z * z / 2);
  let p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  
  if (z > 0) {
    p = 1 - p;
  }
  
  // Convert to percentage and round to nearest integer
  const percentile = Math.round(p * 100);
  return Math.min(Math.max(percentile, 1), 99); // Clamp between 1st and 99th percentiles
}

export interface GrowthResult {
  percentile: number;
  zScore: number;
  bmi?: number;
  type: 'weight-for-length' | 'bmi-for-age';
  status: 'underweight' | 'healthy' | 'overweight' | 'obese';
  friendlyMessage: string;
}

export function calculateGrowthPercentile(
  sex: 'boy' | 'girl',
  ageMonths: number,
  weightKg: number,
  lengthCm: number
): GrowthResult {
  const isUnder24 = ageMonths < 24;
  let zScore = 0;
  let percentile = 50;
  let bmiValue: number | undefined;

  if (isUnder24) {
    // Under 24 months: Weight-for-length
    const referenceData = sex === 'boy' ? WFL_BOYS : WFL_GIRLS;
    const lms = interpolate(lengthCm, referenceData);
    
    // Z-score formula: Z = ((X / M)^L - 1) / (L * S)
    zScore = (Math.pow(weightKg / lms.M, lms.L) - 1) / (lms.L * lms.S);
    percentile = zToPercentile(zScore);
  } else {
    // 24 to 60 months (2-5 years): BMI-for-age
    const lengthM = lengthCm / 100;
    bmiValue = weightKg / (lengthM * lengthM);
    
    const referenceData = sex === 'boy' ? BMI_BOYS : BMI_GIRLS;
    const lms = interpolate(ageMonths, referenceData);
    
    zScore = (Math.pow(bmiValue / lms.M, lms.L) - 1) / (lms.L * lms.S);
    percentile = zToPercentile(zScore);
  }

  // Determine nutritional status based on percentile
  // Under 5th percentile: underweight
  // 5th to 85th percentile: healthy weight
  // 85th to 95th percentile: overweight
  // Over 95th percentile: obese
  let status: 'underweight' | 'healthy' | 'overweight' | 'obese' = 'healthy';
  let friendlyMessage = '';

  if (percentile < 5) {
    status = 'underweight';
    friendlyMessage = `Your baby is in the ${percentile}th percentile — growing and unique!`;
  } else if (percentile <= 85) {
    status = 'healthy';
    friendlyMessage = `Your baby is in the ${percentile}th percentile — growing beautifully!`;
  } else if (percentile <= 95) {
    status = 'overweight';
    friendlyMessage = `Your baby is in the ${percentile}th percentile — growing nice and strong!`;
  } else {
    status = 'obese';
    friendlyMessage = `Your baby is in the ${percentile}th percentile — growing big and strong!`;
  }

  return {
    percentile,
    zScore,
    bmi: bmiValue ? Math.round(bmiValue * 10) / 10 : undefined,
    type: isUnder24 ? 'weight-for-length' : 'bmi-for-age',
    status,
    friendlyMessage
  };
}
