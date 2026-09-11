export const CITATIONS = {
  tpa_108m: {
    short: 'Transfer of Property Act, 1882 §108(m)',
    full: 'The lessee is bound to put the lessor into possession of the property at the termination of the lease, in as good condition as it was when he took it, reasonable wear and tear excepted, and to repair all damage caused by his negligence or that of persons employed by him.'
  },
  ka_rent_47: {
    short: 'Karnataka Rent Act, 1999 §47',
    full: 'Every landlord shall be bound to keep the premises let to a tenant in good and tenantable condition. The landlord shall carry out structural repairs specified in Part A of the Fifth Schedule.'
  },
  ka_rent_48a: {
    short: 'Karnataka Rent Act, 1999 §48(a)',
    full: 'A tenant shall be bound to pay the rent and other charges due from him to the landlord in accordance with the terms and conditions of the agreement.'
  },
  ka_rent_48b: {
    short: 'Karnataka Rent Act, 1999 §48(b)',
    full: 'A tenant shall be bound to maintain the premises in good and clean condition and not to cause any damage to the premises.'
  },
  ka_rent_48d: {
    short: 'Karnataka Rent Act, 1999 §48(d)',
    full: 'A tenant shall be bound to carry out the day to day repairs specified in Part B of the Fifth Schedule at his own cost.'
  },
  mta_11_advisory: {
    short: 'Model Tenancy Act, 2021 §11(2) (advisory — Karnataka has not adopted)',
    full: 'The security deposit shall be refunded by the landlord to the tenant at the time of taking over vacant possession of the premises, after making due deductions.'
  },
  sc_fateh_chand: {
    short: 'Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)',
    full: 'Compensation for breach of contract cannot be awarded arbitrarily and must correspond to the actual loss suffered.'
  },
  sc_maula_bux: {
    short: 'Maula Bux v. Union of India (AIR 1970 SC 1955)',
    full: 'Damages must reflect genuine, demonstrable loss — not assumptions or assertions.'
  },
  sc_kamal_kumar: {
    short: 'Kamal Kumar v. Premlata Joshi',
    full: 'Deductions from a security deposit require evidentiary support; mere assertions by the landlord are insufficient.'
  },
  industry_10pct: {
    short: 'Industry standard (Karnataka rental agreements)',
    full: '10% annual depreciation on fixtures is a common contractual convention in Karnataka rental agreements. It is NOT a statutory cap and depends on the specific agreement.'
  }
} as const;

export type CitationKey = keyof typeof CITATIONS;
