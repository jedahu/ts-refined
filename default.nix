#!/usr/bin/env nix-build

{ pkgs ? import <nixpkgs> {} }:

pkgs.callPackage ./derivation.nix { pname = "ts-refined"; }
