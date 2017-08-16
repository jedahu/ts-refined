{ pkgs ? import <nixpkgs> {} }:

with pkgs;
stdenv.mkDerivation {
  name = "env";
  buildInputs = [
    gitAndTools.git
    nodejs
    rsync
    yarn
  ];
  shellHook = ''
    export PATH="$(yarn bin):$PATH"
  '';
}
