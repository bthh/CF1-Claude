use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("schema");

    // Create schema directory if it doesn't exist
    fs::create_dir_all(&dest_path).unwrap();

    println!("cargo:rerun-if-changed=src/");
    println!("cargo:rerun-if-changed=examples/schema.rs");
}
