#!/bin/bash
# IFC to xeogl pipeline demo - see README.md

# Convert IFC to COLLADA
./IfcConvert ./structure.ifc  ./structure.dae
./IfcConvert ./sprinklers.ifc  ./sprinklers.dae
./IfcConvert ./plumbing.ifc  ./plumbing.dae
./IfcConvert ./fireAlarms.ifc  ./fireAlarms.dae
./IfcConvert ./electrical.ifc  ./electrical.dae


# Convert COLLADA to glTF
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i ./structure.dae -o ./structure.gltf
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i ./sprinklers.dae -o ./sprinklers.gltf
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i ./plumbing.dae -o ./plumbing.gltf
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i ./fireAlarms.dae -o ./fireAlarms.gltf
./COLLADA2GLTF/build/COLLADA2GLTF-bin -i ./electrical.dae -o ./electrical.gltf
