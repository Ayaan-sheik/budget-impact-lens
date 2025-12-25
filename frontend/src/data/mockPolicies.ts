export interface Policy {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  source: string;
  date: string;
  impact: number; // in INR, positive = benefit, negative = cost
  impactType: "positive" | "negative" | "neutral";
  category: string;
  affectedStates: string[];
  isNew?: boolean;
  isHot?: boolean;
  details: {
    directImpact: number;
    indirectImpact: number;
    factors: { label: string; amount: number }[];
  };
}

export const mockPolicies: Policy[] = [
  {
    id: "1",
    title: "GST Rate Reduction on Essential Items",
    shortTitle: "GST Cut on Essentials",
    description: "Government reduces GST on essential food items from 5% to 0%, effective immediately.",
    source: "PIB",
    date: "2024-01-15",
    impact: 450,
    impactType: "positive",
    category: "Taxation",
    affectedStates: ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi"],
    isNew: true,
    isHot: true,
    details: {
      directImpact: 350,
      indirectImpact: 100,
      factors: [
        { label: "Food expenses savings", amount: 280 },
        { label: "Grocery price reduction", amount: 120 },
        { label: "Transport cost benefit", amount: 50 },
      ],
    },
  },
  {
    id: "2",
    title: "New Income Tax Regime Changes",
    shortTitle: "Tax Regime Update",
    description: "Standard deduction increased to ₹75,000 under new tax regime for FY 2024-25.",
    source: "RBI",
    date: "2024-01-10",
    impact: 625,
    impactType: "positive",
    category: "Income Tax",
    affectedStates: ["All States"],
    isNew: true,
    details: {
      directImpact: 500,
      indirectImpact: 125,
      factors: [
        { label: "Standard deduction benefit", amount: 375 },
        { label: "Tax slab adjustment", amount: 200 },
        { label: "Surcharge reduction", amount: 50 },
      ],
    },
  },
  {
    id: "3",
    title: "Fuel Price Increase Due to Global Oil",
    shortTitle: "Fuel Price Hike",
    description: "Petrol and diesel prices increased by ₹2.50/litre due to rising crude oil prices.",
    source: "Ministry of Finance",
    date: "2024-01-08",
    impact: -180,
    impactType: "negative",
    category: "Fuel & Energy",
    affectedStates: ["Maharashtra", "Karnataka", "Rajasthan", "Madhya Pradesh"],
    isHot: true,
    details: {
      directImpact: -120,
      indirectImpact: -60,
      factors: [
        { label: "Daily commute cost", amount: -90 },
        { label: "Grocery transport", amount: -50 },
        { label: "Delivery charges", amount: -40 },
      ],
    },
  },
  {
    id: "4",
    title: "PM Kisan Scheme Amount Increased",
    shortTitle: "PM Kisan Boost",
    description: "Annual benefit under PM Kisan scheme increased from ₹6,000 to ₹8,000.",
    source: "PIB",
    date: "2024-01-05",
    impact: 667,
    impactType: "positive",
    category: "Agriculture",
    affectedStates: ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Maharashtra"],
    details: {
      directImpact: 667,
      indirectImpact: 0,
      factors: [
        { label: "Direct benefit transfer", amount: 667 },
      ],
    },
  },
  {
    id: "5",
    title: "LPG Cylinder Subsidy Reduction",
    shortTitle: "LPG Subsidy Cut",
    description: "LPG subsidy reduced for non-PMUY beneficiaries, effective next month.",
    source: "Ministry of Petroleum",
    date: "2024-01-03",
    impact: -75,
    impactType: "negative",
    category: "Fuel & Energy",
    affectedStates: ["All States"],
    details: {
      directImpact: -75,
      indirectImpact: 0,
      factors: [
        { label: "Monthly LPG cost increase", amount: -75 },
      ],
    },
  },
  {
    id: "6",
    title: "Electric Vehicle Purchase Incentive",
    shortTitle: "EV Incentive",
    description: "New subsidy of ₹1.5 lakh for electric vehicle purchases under FAME III.",
    source: "Ministry of Heavy Industries",
    date: "2024-01-01",
    impact: 0,
    impactType: "neutral",
    category: "Transport",
    affectedStates: ["All States"],
    isNew: true,
    details: {
      directImpact: 0,
      indirectImpact: 0,
      factors: [
        { label: "Potential savings (if purchasing EV)", amount: 150000 },
      ],
    },
  },
];

export const categories = [
  "All",
  "Taxation",
  "Income Tax",
  "Fuel & Energy",
  "Agriculture",
  "Transport",
  "Healthcare",
  "Education",
];

export const sources = [
  { name: "PIB", fullName: "Press Information Bureau" },
  { name: "RBI", fullName: "Reserve Bank of India" },
  { name: "Ministry of Finance", fullName: "Ministry of Finance" },
  { name: "Ministry of Petroleum", fullName: "Ministry of Petroleum" },
  { name: "Ministry of Heavy Industries", fullName: "Ministry of Heavy Industries" },
];

export const monthlyImpactData = [
  { month: "Aug", impact: 320 },
  { month: "Sep", impact: -150 },
  { month: "Oct", impact: 480 },
  { month: "Nov", impact: 290 },
  { month: "Dec", impact: 560 },
  { month: "Jan", impact: 847 },
];

export const categoryBreakdown = [
  { category: "Taxation", amount: 450, percentage: 35 },
  { category: "Income Tax", amount: 325, percentage: 25 },
  { category: "Fuel & Energy", amount: -180, percentage: 14 },
  { category: "Agriculture", amount: 200, percentage: 16 },
  { category: "Other", amount: 52, percentage: 10 },
];
