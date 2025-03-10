export function mergeObjects<A, B>(a: A, b: B): A {
    return { ...a, ...b };
}

export function withDefault<A>(a: A | undefined | null, b: A): A {
    return (a ?? b)
}

export function withDefaultEmptyObject<A>(a: A | undefined | null): A {
    return (a ?? {}) as A
}

export function withDefaultEmptyArray<A>(a: A | undefined | null): A {
    return (a ?? []) as A
}
