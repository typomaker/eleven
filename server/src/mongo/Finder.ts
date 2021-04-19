import Reader from "./Reader";
import Repository from "./Repository";

export class Finder<T extends object> {
  private condition?: Finder.Condition<T>

  constructor(private readonly repository: Repository<T>) { }

  public clone(): Finder<T> {
    const clone = new Finder<T>(this.repository);
    clone.condition = this.condition;
    return clone;
  }

  public and<T1 extends T>(condition: Finder.Condition<T>): Finder<T> {
    const clone = this.clone()
    clone.condition = clone.condition ? [clone.condition, "&", condition] : condition;
    return clone;
  }

  public or(condition: Finder.Condition<T>): Finder<T> {
    const clone = this.clone()
    clone.condition = clone.condition ? [clone.condition, "|", condition] : condition;
    return clone;
  }

  public by(condition: Finder.Condition<T>): Finder<T> {
    const clone = this.clone()
    clone.condition = condition;
    return clone;
  }

  public read(): Reader<T> {
    return new Reader(this.repository, this.condition)
  }

  public one() {
    return this.read().one()
  }

  public all() {
    return this.read().all()
  }
}

export namespace Finder {
  export type Path<T> =
    T extends Date | string | number | boolean | bigint | RegExp ? never :
    T extends Array<infer S> ? Path<S> & string :
    (T extends object ? { [K in keyof Required<T>]: K & string | Path.Item<T, K> }[keyof T] : never)

  export namespace Path {
    export type Item<T, K extends keyof T> = `${K & string}.${Path<T[K]> & string}`

    export type Type<T, Q extends Path<T>> = (
      | T extends Array<infer SUB> ? (
        Q extends Path<SUB> ? Type<SUB, Q> : never
      ) : never
      | Q extends keyof T ? T[Q] : never
      | Q extends `${infer P}.${infer REST}` ? (
        P extends keyof T ? (
          REST extends Path<T[P]> ? Type<T[P], REST> : never
        ) : never
      ) : never
      // Q extends keyof T ? T[Q] : (
      //   T extends Array<infer SUB> ? (
      //     Q extends Path<SUB> ? Type<SUB, Q> : never
      //   ) : (
      //     Q extends `${infer P}.${infer REST}` ? (
      //       P extends keyof T ? (
      //         REST extends Path<T[P]> ? (
      //           // here
      //           Type<T[P], REST>
      //         ) : (
      //           T[P] extends Array<infer SUB> ? (
      //             REST extends Path<SUB> ? Type<SUB, REST> : never
      //           ) : never
      //         )
      //       ) : 3
      //     ) : 4
      //   )
      // )
    )
  }

  export type Condition<T> = Condition.Comparison<T> | Condition.Logical<T>
  export namespace Condition {

    export type Comparison<T> = {
      [K in Path<T>]: (
        | [K, "exist" | "!exist"]
        | [K, ("<=" | ">=" | "!=") | ("=" | ">" | "<"), Path.Type<T, K>]
        | [K, ("in" | "!in"), Path.Type<T, K>[]]
        | [K, "match", Path.Type<T, K> extends Array<infer S> ? Condition<S> : never]
      )
    }[Path<T>]

    export type Logical<T> = [Condition<T>, "&" | "|", Condition<T>]
  }
}

export default Finder