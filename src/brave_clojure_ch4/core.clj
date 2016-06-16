(ns brave-clojure-ch4.core)

; fibonacci
(def fib-seq (cons 1 (cons 1 (lazy-seq (map + fib-seq (rest fib-seq))))))
(defn fib
  "Take the n-th Fibonacci number."
  [n]
  (nth fib-seq n))

(def z+ (map inc (range)))
(map fib (take 10 z+))
