type User = {
	key: string;
	email: string;
	password: string;
};

const ENV = process.env.ENV_NAME || 'dev';

export function getUsers(): User[] {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	return require(`@/ui/test-data/${ENV}/users.json`).users;
}

export function getUserByIndex(index: number): User {
	const users = getUsers();
	return users[index % users.length];
}
