
# Battle Damaged Sci-fi Helmet - PBR (modified) 

The original version of this model was created by http://www.leonardocarrion.com/
( https://sketchfab.com/theblueturtle_ ), and published under the Creative 
Commons Attribution-NonCommercial license, at 
https://sketchfab.com/models/b81008d513954189a063ff901f7abfe4

The original glTF version was downloaded from https://sketchfab.com/features/gltf 
(download link: https://gltf.sketchfab.com/models/damagedHelmet.zip )

The shader implementations have been taken from 
https://github.com/moneimne/WebGL-PBR/

## Modifications

The following modifications have been made:

- The textures have been flipped vertically
- The `glTF` file was modified:
  - Duplications and transforms of nodes have been removed
  - It does not use any extension, but instead refers to the 
    shaders that contain the basic PBR implementation, which
    are taken from https://github.com/moneimne/WebGL-PBR/
  - Other minor cleanups, so that it passes glTF 1.1 validation,
    *except* for the unknown `TANGENT` semantic
- The shaders, as originally taken from https://github.com/moneimne/WebGL-PBR/,
  have been modified so that they match the glTF, including some further
  preliminary fixes. They will be updated to extend the PBR support in 
  the future.
  
      
## Screenshot

![screenshot](screenshot/screenshot.png)

  