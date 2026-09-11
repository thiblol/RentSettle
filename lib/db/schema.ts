import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey(),
  scenarioId: text('scenario_id').notNull(),
  tenantName: text('tenant_name').notNull(),
  landlordName: text('landlord_name').notNull(),
  propertyAddress: text('property_address').notNull(),
  monthlyRent: integer('monthly_rent').notNull(),     // paise
  depositAmount: integer('deposit_amount').notNull(),   // paise
  moveInDate: text('move_in_date').notNull(),
  moveOutDate: text('move_out_date').notNull(),
  status: text('status', { enum: ['intake', 'calc', 'negotiate', 'settled', 'escalated'] }).notNull().default('intake'),
  createdAt: text('created_at').notNull()
});

export const claims = sqliteTable('claims', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  category: text('category', { enum: ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'] }).notNull(),
  claimedBy: text('claimed_by', { enum: ['tenant', 'landlord'] }).notNull(),
  amountClaimed: integer('amount_claimed').notNull().default(0),
  evidenceJson: text('evidence_json').notNull().default('{}'),
  decision: text('decision', { enum: ['allow', 'deny', 'cap', 'pending'] }).notNull().default('pending'),
  amountAllowed: integer('amount_allowed').notNull().default(0),
  reasoning: text('reasoning').notNull().default(''),
  citedAuthority: text('cited_authority').notNull().default('')
});

export const negotiations = sqliteTable('negotiations', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  currentRound: integer('current_round').notNull().default(0),
  tenantOffer: integer('tenant_offer'),
  landlordOffer: integer('landlord_offer'),
  gapPercent: integer('gap_percent').notNull().default(0),  // basis points (500 = 5%)
  status: text('status', { enum: ['open', 'settled', 'escalated'] }).notNull().default('open'),
  settledAt: text('settled_at')
});

export const offers = sqliteTable('offers', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  byRole: text('by_role', { enum: ['tenant', 'landlord'] }).notNull(),
  amount: integer('amount').notNull(),
  timestamp: text('timestamp').notNull()
});

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Negotiation = typeof negotiations.$inferSelect;
export type NewNegotiation = typeof negotiations.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
