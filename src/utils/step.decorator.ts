import { test } from '@playwright/test';

type AnyFunction = (...args: any[]) => any;

export function step(stepName?: string) {
	return function decorator<T extends AnyFunction>(target: T, context: ClassMethodDecoratorContext): T {
		const methodName = String(context.name);

		function replacementMethod(this: any, ...args: any[]): ReturnType<T> {
			const name = stepName || `${this.constructor.name}.${methodName}`;
			return (await test.step(
				name,
				async () => {
					return await target.apply(this, args);
				},
				{ box: true }
			)) as ReturnType<T>;
		}

		return replacementMethod as T;
	};
}
