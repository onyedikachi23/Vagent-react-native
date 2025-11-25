/** @format */

import React from "react";

/**A temporarily implementation of React 19.2 useEffectEvent hook.
 *
 * **NOTE**: To be removed when react-native-renderer supports React 19.2
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
	const ref = React.useRef(fn);
	React.useInsertionEffect(() => {
		ref.current = fn;
	}, [fn]);
	return React.useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(...args: any[]) => {
			const latestFn = ref.current;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
			return latestFn(...args);
		},
		[],
	) as unknown as T;
}
