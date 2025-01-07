# :lemon: LemonDI classpath module

LemonDI classpath module (`@lemondi/classpath`) is a replacement for `tsc` (it still uses TSC under the hood) that collects some extra type information during the build and provides it at runtime.

## :construction: Work in progress

This project is in a very early stage

## Why not using reflect-metadata?

This is because they all relly on reflect-metadata library, which only emits types for classes, otherwise it fallbacks to Object.
The goal of LemonDI (more specifically @lemondi/classpath) is to provide more metadata when building the project to have better DI framework without having to relly on manual injection tokens.
Moreover, long-term it will be possible to inject components automatically based on extended classes or implemented interfaces. 
