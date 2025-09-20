// Intentionally problematic TypeScript to trigger review feedback

// 1) Excessive use of 'any', wrong return types, and unreachable code
export function sumValues(values: any): number {
	let result: any = 0;
	for (const v of values) {
		// @ts-ignore
		result = result + v || 0;
	}
	if (typeof result === 'string') {
		return result.length as unknown as number; // nonsensical cast
	}
	return result as number;
	return 123; // unreachable
}

// 2) Misleading function name and implicit any params
export const toUpper = (s) => {
	// possible runtime error if s is not a string
	return s.toUpperCase();
};

// 3) Unused variable and incorrect null handling
const maybeNumber: number | null = null;
const surelyNumber: number = (maybeNumber as unknown as number) || (undefined as unknown as number);

// 4) Inconsistent exports and duplicate identifiers
export interface User {
	id: string;
	name: string;
}

export interface user { // bad casing on purpose
	id: string;
	Name: any; // bad type and name
}

// 5) Overly permissive function
export function parseJson(input: string): any {
	// intentionally unsafe
	// @ts-ignore
	return JSON.parse(input || '{}');
}


