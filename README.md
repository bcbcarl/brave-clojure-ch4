# Core Functions in Depth

## Documentations

* [Grimoire](https://conj.io)
* [Using cider-mode](http://cider.readthedocs.io/en/latest/interactive_programming/)

Data structures in Clojure:

```lisp
; numbers
93

; strings
"Lord Voldemort"

; keywords
:a

; maps
{:a 1 :b 2}

; lists
'(1 2 3)

; vectors
[1 2 3]

; sets
#{1 2 3}
```

Questions:

* Why did `map` return a list when you gave it a vector?
* How come `reduce` treats your map like a list of vectors?

What you will learn:

* programming to abstractions
* working with sequences
    * map
    * reduce
    * into
    * conj
    * concat
    * some
    * filter
    * take
    * drop
    * sort
    * sort-by
    * identity
* creating new functions
    * apply
    * partial
    * complement

## Programming to Abstractions

Clojure defines `map` and `reduce` functions in terms of the *sequence abstraction*, not in terms of specific data structures.

### Treating Lists, Vectors, Sets, and Maps as Sequences

Figure 4-1: Visualizing a mapping

![figure-4-1](http://www.braveclojure.com/assets/images/cftbat/core-functions-in-depth/mapping.png)

Figure 4-2: Sequential and nonsequential collections

![figure-4-2](http://www.braveclojure.com/assets/images/cftbat/core-functions-in-depth/collections.png)

```lisp
; positive integers: Z+ = [1, 2 ,3, ...]
(def z+ (map inc (range)))

;Fibonacci sequence
(def fib-seq (cons 1
                   (cons 1
                         (lazy-seq (map +
                                        fib-seq
                                        (rest fib-seq))))))

; Fibonacci function
(defn fib
  "Take the n-th Fibonacci number."
  [n]
  (nth fib-seq n))

; Take 10 fibonacci numbers
(map fib (take 10 z+))
; => (1 2 3 5 8 13 21 34 55 89)
```

```lisp
(concat (take 8 (repeat "na")) ["Batman!"])
; => ("na" "na" "na" "na" "na" "na" "na" "na" "Batman!")

(take 3 (repeatedly #(rand-int 10)))
; => (1 4 0)

(repeatedly 3 #(rand-int 10))
; => (6 3 9)

(repeat 3 (rand-int 10))
; => (9 9 9)
```

If the core sequence functions `first`, `rest`, and `cons` work on a data structure, you can say the data structure implements the sequence abstraction.

Figure 4-3: A linked list

![figure-4-3](http://www.braveclojure.com/assets/images/cftbat/core-functions-in-depth/linked-list.png)

### first, rest and cons

In a linked list, nodes are linked in a linear sequence. Here's how you might create one in JavaScript.

```javascript
const node3 = {
  value: 'last',
  next: null
};

const node2 = {
  value: 'middle',
  next: node3
};

const node1 = {
  value: 'first',
  next: node2
};
```

```javascript
const first = node => node.value;

const rest = node => node.next;

const cons = (newValue, node) => ({ value: newValue, next: node });

const comp = (f, g) => (...args) => f(g(...args));

const map = (list, transform) =>
        (list === null)
        ? null
        : cons(
            comp(transform, first)(list),
            map(rest(list), transform));
```

```javascript
console.log(node1);
// => {
//      value: 'first',
//      next: {
//        value: 'middle',
//        next: {
//          value: 'last',
//          next: null
//        }
//      }
//    }

console.log([
  first(node1),
  first(rest(node1)),
  first(rest(rest(node1)))
].join(', '));
// => first, middle, last
```

```javascript
console.log(map(node1, val => `${val} mapped!`));
// => {
//      value: 'first mapped!',
//      next: {
//        value: 'middle mapped!',
//        next: {
//          value: 'last mapped!',
//          next: null
//        }
//      }
//    }

console.log([
  first(newList),
  first(rest(newList)),
  first(rest(rest(newList)))
].join(', '));
// => first mapped!, middle mapped!, last mapped!
```

### Abstraction Through Indirection

How a function like `first` is able to work with different data structures?

In programming, indirection is a generic term for the mechanisms a language employs so that one name can have multiple, related meanings.

In this case, the name `first` has multiple, data structure–specific meanings. Indirection is what makes abstraction possible.

*Polymorphism* is one way that Clojure provides indirection.

When it comes to sequences, Clojure also creates indirection by doing a kind of lightweight type conversion, producing a data structure that works with an abstraction's functions.

```lisp
(seq '(1 2 3))
; => (1 2 3)

(seq [1 2 3])
; => (1 2 3)

(seq #{1 2 3})
; => (1 2 3)

(seq {:name "Bill Compton" :occupation "Dead mopey guy"})
; => ([:name "Bill Compton"] [:occupation "Dead mopey guy"])
```

There are two notable details here:

* The `seq` always returns a value that looks and behaves like a list; you'd call this value a sequence or seq.
* The sequence of a map consists of two-element key-value vectors. That's why `map` treats your maps like lists of vectors!

You can convert the seq back into a map by using `into` to stick the result into an empty map:

```lisp
(into {} (seq {:a 1 :b 2 :c 3}))
; => {:a 1, :c 3, :b 2}
```

## Seq Function Examples

### map

Emacs Lisp:

```lisp
; lists
(mapcar '1+ '(1 2 3))
; => (2 3 4)

; maps
(defsubst hash-table-keys (hash-table)
  "Return a list of keys in HASH-TABLE."
  (let ((keys '()))
    (maphash (lambda (k _v) (push k keys)) hash-table)
    keys))

(setq h (make-hash-table))

(puthash "Batman" "Bruce Wayne" h)
(puthash "Spiderman" "Peter Parker" h)
(puthash "Superman" "Clark Kent" h)

(hash-table-keys h)
; => ("Batman" "Spiderman" "Superman")
```

Clojure:

```lisp
; lists
(map inc '(1 2 3))
; => (2 3 4)
(map str ["a" "b" "c"] ["A" "B" "C"])
; => ("aA" "bB" "cC")

; maps
(def identities
  [{:alias "Batman" :real "Bruce Wayne"}
   {:alias "Spider-Man" :real "Peter Parker"}
   {:alias "Santa" :real "Your mom"}
   {:alias "Easter Bunny" :real "Your dad"}])

(map :real identities)
; => ("Bruce Wayne" "Peter Parker" "Your mom" "Your dad")
```

### reduce

Emacs Lisp:

```lisp
(require 'cl)

; lists
(reduce '+ '(1 2 3))
; => 6
```

Clojure:

```lisp
; lists
(reduce + '(1 2 3))
; => 6

; maps
(reduce conj #{} {:a 1 :b 2 :c 3})
; => #{[:c 3] [:b 2] [:a 1]}
```

### take and drop

```lisp
(take 3 [1 2 3 4 5 6 7 8 9 10])
; => (1 2 3)

(drop 3 [1 2 3 4 5 6 7 8 9 10])
; => (4 5 6 7 8 9 10)
```

### take-while and drop-while

```lisp
(def food-journal
  [{:month 1 :day 1 :human 5.3 :critter 2.3}
   {:month 1 :day 2 :human 5.1 :critter 2.0}
   {:month 2 :day 1 :human 4.9 :critter 2.1}
   {:month 2 :day 2 :human 5.0 :critter 2.5}
   {:month 3 :day 1 :human 4.2 :critter 3.3}
   {:month 3 :day 2 :human 4.0 :critter 3.8}
   {:month 4 :day 1 :human 3.7 :critter 3.9}
   {:month 4 :day 2 :human 3.7 :critter 3.6}])

(take-while #(< (:month %) 3) food-journal)
; => ({:month 1 :day 1 :human 5.3 :critter 2.3}
;     {:month 1 :day 2 :human 5.1 :critter 2.0}
;     {:month 2 :day 1 :human 4.9 :critter 2.1}
;     {:month 2 :day 2 :human 5.0 :critter 2.5})

(drop-while #(< (:month %) 3) food-journal)
; => ({:month 3 :day 1 :human 4.2 :critter 3.3}
;     {:month 3 :day 2 :human 4.0 :critter 3.8}
;     {:month 4 :day 1 :human 3.7 :critter 3.9}
;     {:month 4 :day 2 :human 3.7 :critter 3.6})

```

### filter and some

```lisp
(filter #(< (:human %) 5) food-journal)
; => ({:month 2 :day 1 :human 4.9 :critter 2.1}
;     {:month 3 :day 1 :human 4.2 :critter 3.3}
;     {:month 3 :day 2 :human 4.0 :critter 3.8}
;     {:month 4 :day 1 :human 3.7 :critter 3.9}
;     {:month 4 :day 2 :human 3.7 :critter 3.6})

(some #(> (:critter %) 5) food-journal)
; => nil

(some #(> (:critter %) 3) food-journal)
; => true
```

### sort and sort-by

```lisp
(sort [3 1 2])
; => (1 2 3)

(sort-by count ["aaa" "c" "bb"])
; => ("c" "bb" "aaa")
```

### concat

```lisp
(concat [1 2] [3 4])
; => (1 2 3 4)
```

## The Collection Abstraction

```lisp
(map identity {:sunlight-reaction "Glitter!"})
; => ([:sunlight-reaction "Glitter!"])

(into {} (map identity {:sunlight-reaction "Glitter!"}))
; => {:sunlight-reaction "Glitter!"}

(conj [0] [1])
; => [0 [1]]

(into [0] [1])
; => [0 1]

(conj [0] 1)
; => [0 1]

(conj [0] 1 2 3 4)
; => [0 1 2 3 4]

(defn my-conj
  [target & additions]
  (into target additions))

(my-conj [0] 1 2 3)
; => [0 1 2 3]
```

## Function Functions

### apply

```lisp
(max 0 1 2)
; => 2

(max [0 1 2])
; => [0 1 2]

(apply max [0 1 2])
; => 2

(defn my-into
  [target additions]
  (apply conj target additions))

(my-into [0] [1 2 3])
; => [0 1 2 3]
```

### partial

```lisp
(def add10 (partial + 10))
(add10 3)
; => 13
(add10 5)
; => 15

(def add-missing-elements
  (partial conj ["water" "earth" "air"]))

(add-missing-elements "unobtainium" "adamantium")
; => ["water" "earth" "air" "unobtainium" "adamantium"]
```

### complement

```lisp
(def not-vampire? (complement vampire?))
(defn identify-humans
  [social-security-numbers]
  (filter not-vampire?
          (map vampire-related-details social-security-numbers)))
```

## Summary

* Clojure emphasizes programming to abstractions.
* The sequence abstraction deals with operating on the individual elements of a sequence.
* Seq functions often convert their arguments to a seq and return a lazy seq.
* Lazy evaluation improves performance by delaying computations until they are needed.
* The collection abstraction deals with data structures as a whole.