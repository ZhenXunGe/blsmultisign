#!/bin/bash

set -e

# rm -rf output

CLI=~/zkWasm/target/release/cli

PUBKEYS=

source extractor/pubkeys.sh

set -x

# Single test
RUST_LOG=info $CLI -k 20 --function zkmain --output ./output --wasm bls.wasm setup

RUST_LOG=info $CLI -k 20 --function zkmain --output ./output --wasm bls.wasm single-prove --public $NB_PUBKEY:i64 --private $PUBKEYS
RUST_LOG=info $CLI -k 20 --function zkmain --output ./output --wasm bls.wasm single-verify --proof output/zkwasm.0.transcript.data --public $NB_PUBKEY:i64
RUST_LOG=info $CLI -k 20 --function zkmain --output ./output --wasm bls.wasm aggregate-prove
RUST_LOG=info $CLI -k 20 --function zkmain --output ./output --wasm bls.wasm aggregate-verify --proof output/aggregate-circuit.0.transcript.data  --instances output/aggregate-circuit.0.instance.data
