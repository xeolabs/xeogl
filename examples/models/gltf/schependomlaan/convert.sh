#!/bin/bash
# IFC to xeogl pipeline demo - see README.md

# Convert IFC to COLLADA
./IfcConvert ifc/schependomlaan.ifc  dae/schependomlaan.dae
./IfcConvert ifc/WILLEMSEN-Laagbouw.ifc  dae/WILLEMSEN-Laagbouw.dae

# Convert COLLADA to glTF
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i dae/schependomlaan.dae -o gltf/schependomlaan.gltf
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i dae/WILLEMSEN-Laagbouw.dae -o gltf/WILLEMSEN-Laagbouw.gltf

# Optimize glTF (optional)
# node ./gltf-pipeline/bin/gltf-pipeline.js -i gltf/schependomlaan.dae -o gltf/schependomlaan.optimized.gltf
