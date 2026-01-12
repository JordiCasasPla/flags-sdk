import { sha256 } from "js-sha256";
import type { Flag, FlagRule, FlagsContext } from "./types";

/**
 * Deterministic rollout utilities for feature flags
 *
 * Uses a hash-based approach to ensure that the same user/company
 * always gets the same result for a given feature flag, while
 * distributing the rollout evenly across the population.
 */

/**
 * Generates a hashed integer based on the input string. The method extracts 20 bits from the hash,
 * scales it to a range between 0 and 100000, and returns the resultant integer.
 *
 * @param {string} hashInput - The input string used to generate the hash.
 * @return {number} A number between 0 and 100000 derived from the hash of the input string.
 */
export function hashInt(hashInput: string): number {
	// 1. hash the key and the partial rollout attribute
	// 2. take 20 bits from the hash and divide by 2^20 - 1 to get a number between 0 and 1
	// 3. multiply by 100000 to get a number between 0 and 100000 and compare it to the threshold
	//
	// we only need 20 bits to get to 100000 because 2^20 is 1048576
	const value =
		new DataView(sha256.create().update(hashInput).arrayBuffer()).getUint32(
			0,
			true,
		) & 0xfffff;

	return Math.floor((value / 0xfffff) * 100000);
}

/**
 * Determines if a user/company should be included in a rollout
 * based on the rollout percentage.
 *
 * @param flagKey - The feature flag key
 * @param targetId - The user or company ID (external ID)
 * @param rolloutPercentage - Percentage (0-100) of users to include
 * @returns true if the target should have the feature enabled
 */
export function isInRollout(
	flagKey: string,
	targetId: string,
	rolloutPercentage: number,
): boolean {
	if (rolloutPercentage >= 100) {
		return true;
	}

	if (rolloutPercentage <= 0) {
		return false;
	}

	// Use the new hashInt logic with SHA-256
	// Consistent with the robust engine logic, but simplified for single use
	const hashVal = hashInt(`${flagKey}.${targetId}`);

	// rolloutPercentage is 0-100, hashVal is 0-100000
	// Scale rolloutPercentage to compare correctly
	return hashVal < rolloutPercentage * 1000;
}

export function isFlagEnabled(
	flagKey: Flag["key"],
	flags: Flag[],
	context: FlagsContext,
) {
	const flag = flags.find((f: Flag) => f.key === flagKey);

	if (!flag) {
		return { key: flagKey, isEnabled: false };
	}

	if (flag.isArchived) {
		return { key: flag.key, isEnabled: false };
	}

	if (flag.rolledOutToEveryoneAt) {
		return { key: flag.key, isEnabled: true };
	}

	if (!flag.rules || flag.rules.length === 0) {
		return { key: flag.key, isEnabled: false };
	}

	// We are currently only supporting a single rule per flag
	const rule = flag.rules[0];
	if (!rule) {
		return { key: flag.key, isEnabled: false };
	}

	const userIds = (rule.userIds as string[]) || [];
	const companyIds = (rule.companyIds as string[]) || [];
	const rolloutPercentage = rule.rolloutPercentage ?? 100;

	let ruleMatches = false;

	switch (rule.operator) {
		case "ALL":
			ruleMatches = true;
			break;
		case "SOME": {
			if (userIds.length === 0 && companyIds.length === 0) {
				ruleMatches = false;
				break;
			}
			const userMatch = !!(
				context.user?.key && userIds.includes(context.user.key)
			);
			const companyMatch = !!(
				context.company?.key && companyIds.includes(context.company.key)
			);
			ruleMatches = userMatch || companyMatch;
			break;
		}
		case "NONE":
			ruleMatches = false;
			break;
	}

	if (!ruleMatches) {
		return { key: flag.key, isEnabled: false };
	}

	const rolloutTargetId = context.user.key || context.company.key || "";
	const isMatch = isInRollout(flag.key, rolloutTargetId, rolloutPercentage);

	return {
		key: flag.key,
		isEnabled: isMatch,
	};
}
