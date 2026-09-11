CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`scenario_id` text NOT NULL,
	`tenant_name` text NOT NULL,
	`landlord_name` text NOT NULL,
	`property_address` text NOT NULL,
	`monthly_rent` integer NOT NULL,
	`deposit_amount` integer NOT NULL,
	`move_in_date` text NOT NULL,
	`move_out_date` text NOT NULL,
	`status` text DEFAULT 'intake' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`category` text NOT NULL,
	`claimed_by` text NOT NULL,
	`amount_claimed` integer DEFAULT 0 NOT NULL,
	`evidence_json` text DEFAULT '{}' NOT NULL,
	`decision` text DEFAULT 'pending' NOT NULL,
	`amount_allowed` integer DEFAULT 0 NOT NULL,
	`reasoning` text DEFAULT '' NOT NULL,
	`cited_authority` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `negotiations` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`current_round` integer DEFAULT 0 NOT NULL,
	`tenant_offer` integer,
	`landlord_offer` integer,
	`gap_percent` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`settled_at` text,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`round_number` integer NOT NULL,
	`by_role` text NOT NULL,
	`amount` integer NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
