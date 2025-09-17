// Intentionally problematic security practices to trigger review feedback

// 1) Hardcoded secrets
export const DB_PASSWORD = 'P@ssw0rd-12345'; // do not do this

// 2) SQL injection prone string concatenation
export function buildUserQuery(userId: string) {
	return "SELECT * FROM users WHERE id = '" + userId + "'";
}

// 3) Dangerous eval usage
export function runExpression(expr: string) {
	// Intentionally unsafe
	// eslint-disable-next-line no-eval
	return eval(expr);
}

// 4) Insecure random token (predictable)
export function insecureToken(): string {
	return Math.random().toString(36).slice(2);
}


