import { test } from '@playwright/test';

type AnyFunction = (this: any, ...args: any[]) => any;

export function step(stepName?: string) {
	return function <T extends AnyFunction>(originalMethod: T, context: ClassMethodDecoratorContext<any, T>): T {
		const methodName = String(context.name);

		function replacement(this: any, ...args: Parameters<T>): ReturnType<T> {
			const name = stepName ?? `${this.constructor?.name ?? 'Object'}.${methodName}`;
			return (await test.step(name, () => originalMethod.apply(this, args), { box: true })) as ReturnType<T>;
		}

		return replacement as T;
	};
}
