#!/usr/bin/env nix-build

{ pkgs ? import <nixpkgs> {}, pname }:

with pkgs;
with builtins;
let
  copy = {echo ? false}: paths: runCommand "copy" {}
    ( ''mkdir -p "$out"
      ''
      +
      ( concatStringsSep "\n"
        ( map (p:
            let
              from = elemAt p 0;
              to = ''$out/${elemAt p 1}'';
              cmd = ''cp -r "${from}" "${to}"'';
              echo-cmd = ''
                echo ${cmd}
              '';
              run-cmd = ''
                mkdir -p "$(dirname "${to}")"
                ${cmd}
              '';
            in
              if echo
              then echo-cmd + run-cmd
              else run-cmd
            ) paths
        )
      )
    );

  node-modules = pkgs.stdenv.mkDerivation {
    name = "${pname}-node-modules";
    src = copy {} [
      [./package.json "package.json"]
      [./yarn.lock "yarn.lock"]
    ];
    phases = "unpackPhase buildPhase";
    buildInputs = [yarn];
    buildPhase = ''
      mkdir "$out"
      export HOME="$out/.yarn-home"
      exec yarn --pure-lockfile --modules-folder "$out"
    '';
  };

  dist = pkgs.stdenv.mkDerivation {
    name = pname;
    src = copy {} [
      [./src "src"]
      [./tsconfig.json "tsconfig.json"]
      [./package.json "package.json"]
      [./yarn.lock "yarn.lock"]
      [./README.md "README.md"]
    ];
    buildInputs = [nodejs];
    phases = "unpackPhase buildPhase";
    buildPhase = ''
      mkdir "$out"

      export NODE_PATH="${node-modules}"
      "${node-modules}/.bin/tsc" --outDir "$out"
      cp package.json yarn.lock README.md "$out"
    '';
  };

in
  dist
