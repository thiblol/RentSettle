// All currency in integer paise (₹1 = 100).
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;
export const formatRupees = (paise: number): string =>
  `₹${paiseToRupees(paise).toLocaleString('en-IN')}`;
