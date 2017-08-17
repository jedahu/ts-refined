// #+TITLE: ts-refined
// #+AUTHOR: Jeremy Hughes
// #+EMAIL: jedahu@gmail.com
// #+DATE: [2017-07-26 Wed]


// ** Summary

// Refined types are essentially a type paired with a predicate which narrows
// its set of legal values.

// This implementation is lightweight. It involves no boxing and unboxing of the
// base type. Instead the refined type is formed as an intersection of the base
// type and a tag type. The tag type is the type of the predicate.

// In order for this to work:
//   - the predicate must have a type-level representation, and
//   - casting must be avoided.

// The first involves a small amount of boilerplate. The second is common sense
// for programming with types.

// The examples in this documentaton use the following predicate types:

// #+BEGIN_SRC typescript :example t
// class NotBlank implements Refinement<string> {
//     "@nominal" : "926e6136-a210-4231-ad08-30d14fa218cf";
//     test = (a : string) => !/^\s*$/.test(a);
// }

// class LowerCase implements Refinement<string> {
//     "@nominal" : "d852de1e-e229-4077-a069-26068c804a34";
//     test = (a : string) => a === a.toLowerCase();
// }

// class BasicLatin implements Refinement<string> {
//     "@nominal" : "6023125b-f468-4d6c-b76f-8b8372e83b17";
//     test = (a : string) => /^\w*$/.test(a);
// }
// #+END_SRC


// ** Refinement predicate type

// Predicates should implement this type as a named class so they have a
// unique type-level identifier.

// - ~<A>~ :: the base type to refine.

export type Refinement<A> = {
    test : (a : A) => boolean;
};


// *** The ~Nil~ predicate type

// The tautological (always true) predicate.

export class Nil implements Refinement<any> {
    "@nominal" : "4079fcdd-99ff-4568-81d4-012b49d112dd";
    test = (a : any) => true;
}


// ** Refinement type

// The shape of a refined type.

// - ~<A>~ the base type that is being narrowed.
// - ~<T>~ the identifier tag, an intersection of refinement predicate types.

export type Refined<A, T> = {
    "@nominal" : "9b68e4a3-162a-4574-ba15-347474197c4b";
    "@tag" : T & Nil;
} & A;


// ** Type guards

// *** ~guard()~

// A type guard that checks that its first argument matches the supplied
// predicates.

// An example type signature:

// #+BEGIN_SRC typescript :example t
// guard(a : string, NotBlank, LowerCase)
//   : a is Refined<string, NotBlank & LowerCase>;
// #+END_SRC

export function guard<A,
    T extends Refinement<A>
    >(
        a : A,
        t : {new() : T}
    ) : a is Refined<A, T>;

export function guard<A,
    T extends Refinement<A>,
    U extends Refinement<A>
    >(
        a : A,
        t : Ctor<T>,
        u : Ctor<U>
    ) : a is Refined<A, T & U>;

export function guard<A,
    T extends Refinement<A>,
    U extends Refinement<A>,
    V extends Refinement<A>
    >(
        a : A,
        t : Ctor<T>,
        u : Ctor<U>,
        v : Ctor<V>
    ) : a is Refined<A, T & U & V>;

export function guard<A>(a : A, ...xs : Array<Ctor<Refinement<A>>>) : a is Refined<A, any> {
    return guardImpl(a, ...xs);
};

// *** ~guards()~

// A type guard that checks that its first argument matches the supplied
// predicates. Intersects the predicate tag of the first argument with the
// supplied predicates.

// An example type signature:

// #+BEGIN_SRC typescript :example t
// guards(a : Refined<string, NotBlank>, LowerCase, BasicLatin)
//   : a is Refined<string, NotBlank, & LowerCase & BasicLatin>;
// #+END_SRC

// Use ~guards~ instead of ~guard~ if you want to pass an already refined
// value and not lose its existing predicate tag.

export function guards<A,
    R,
    T extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>
    ) : a is Refined<A, R & T>;

export function guards<A,
    R,
    T extends Refinement<A>,
    U extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>,
        u : Ctor<U>
    ) : a is Refined<A, R & T & U>;

export function guards<A,
    R,
    T extends Refinement<A>,
    U extends Refinement<A>,
    V extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>,
        u : Ctor<U>,
        v : Ctor<V>
    ) : a is Refined<A, R & T & U & V>;

export function guards<A, R>(
    a : Refined<A, R>,
    ...xs : Array<Ctor<Refinement<A>>>
) : a is Refined<A, R> {
    return guardImpl(a, ...xs);
};


// ** Lifting values into refined types

// *** ~lift()~

// Lift the first argument into a refined type or throw if a predicate fails.

// Example of success:

// #+BEGIN_SRC typescript :example t
// type NBLC = Refined<string, NotBlank & LowerCase>;
// const a : NBLC = lift("jabberwock", NotBlank, LowerCase);
// #+END_SRC

// Example of failure:

// #+BEGIN_SRC typescript :example t
// type NBLC = Refined<string, NotBlank & LowerCase>;
// const a : NBLC = lift("SHOUT", NotBlank, LowerCase);
// // => throws Error: Refinement error: [NotBlank, LowerCase]: SHOUT.
// #+END_SRC

export function lift<A,
    T extends Refinement<A>
    >(
        a : A,
        t : Ctor<T>
    ) : Refined<A, T>;

export function lift<A,
    T extends Refinement<A>,
    U extends Refinement<A>
    >(
        a : A,
        t : Ctor<T>,
        u : Ctor<U>
    ) : Refined<A, T & U>;

export function lift<A,
    T extends Refinement<A>,
    U extends Refinement<A>,
    V extends Refinement<A>
    >(
        a : A,
        t : Ctor<T>,
        u : Ctor<U>,
        v : Ctor<V>
    ) : Refined<A, T & U & V>;

export function lift<A>(
    a : A,
    ...xs : Array<Ctor<Refinement<A>>>
) : Refined<A, any> {
    if (guardImpl(a, ...xs)) {
        return a;
    }
    throw new Error(`Refinement error: ${xs}: ${a}.`);
};


// *** ~lifts()~

// Lift the first argument into a refined type or throw if a predicate fails.
// Intersects the predicate tag of the first argument with the supplied
// predicates.

// Example of success:

// #+BEGIN_SRC typescript :example t
// type NB = Refined<string, NotBlank>;
// type NBLC = Refined<string, NotBlank & LowerCase>;
// const a : NB = lift("jabberwock", NotBlank);
// const b : NBLC = lifts(a, LowerCase);
// #+END_SRC

// Example of failure:

// #+BEGIN_SRC typescript :example t
// type NB = Refined<string, NotBlank>;
// type NBLC = Refined<string, NotBlank & LowerCase>;
// const a : NB = lift("SHOUT", NotBlank);
// const b : NBLC = lifts(a, LowerCase);
// // => throws Error: Refinement error: [LowerCase]: SHOUT.
// #+END_SRC

export function lifts<A,
    R,
    T extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>
    ) : Refined<A, R & T>;

export function lifts<A,
    R,
    T extends Refinement<A>,
    U extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>,
        u : Ctor<U>
    ) : Refined<A, R & T & U>;

export function lifts<A,
    R,
    T extends Refinement<A>,
    U extends Refinement<A>,
    V extends Refinement<A>
    >(
        a : Refined<A, R>,
        t : Ctor<T>,
        u : Ctor<U>,
        v : Ctor<V>
    ) : Refined<A, R & T & U & V>;

export function lifts<A, R extends Refinement<A>>(
    a : Refined<A, R>,
    ...xs : Array<Ctor<Refinement<A>>>
) : Refined<A, R> {
    if (guardImpl(a, ...xs)) {
        return a;
    }
    throw new Error(`Refinement error: ${xs}: ${a}.`);
};

// *** ~liftUnsafe()~

// Lift the first argument into the refined type tagged with the second type
// parameter.

// This is just a cast, but its name highlights that you better know what you
// are doing.

// Example:

// #+BEGIN_SRC typescript :example t
// type NB = Refined<string, NotBlank>;
// const a : NB = liftUnsafe<string, NotBlank>("abc");
// const b : NB = liftUnsafe<string, NotBlank>(" ");
// #+END_SRC

// Both 'a' and 'b' will succeed, with the type of ~b~ now a potentially
// dangerous misrepresentation.

export const liftUnsafe =
    <A, R>(a : A) : Refined<A, R> => a as Refined<A, R>;


// ** Private                                                            :noexport:

function guardImpl<A>(
    a : A,
    ...xs : Array<Ctor<Refinement<A>>>
) : a is Refined<A, any> {
    for (const x of xs) {
        if (!new x().test(a)) return false;
    }
    return true;
};

export type Ctor<A> = {new() : A};
