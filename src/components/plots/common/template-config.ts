export function mergeWithDefaults<TConfig extends Record<string, any>>(
    defaults: TConfig,
    props: Partial<TConfig>
): TConfig {
    const result = { ...defaults };

    for (const key of Object.keys(defaults) as (keyof TConfig)[]) {
        if (props[key] !== undefined) {
            result[key] = props[key]!;
        }
    }

    return result;
}
