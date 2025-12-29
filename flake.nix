{
  description = "JDK 17 for cs-backend";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            javaPackages.compiler.openjdk25
            kotlin
            gradle_9
            python3
            nodejs_24
          ];
          shellHook = ''
            echo "Available tools:"
            echo "  - Java:      $(java -version 2>&1 | head -n 1)"
            echo "  - Gradle:    $(gradle --version | grep Gradle | head -n 1)"
            echo "  - Python:    $(python3 --version)"
            echo ""

            # Set up environment variables
            export JAVA_HOME=${pkgs.javaPackages.compiler.openjdk25}
          '';
        };
      }
    );
}