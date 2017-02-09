// From https://raw.githubusercontent.com/tsturm/glTF/e0e419a11ceae9edea541c58a512f20bf1e8f2c7/extensions/Vendor/FRAUNHOFER_materials_pbr/example/untextured-pbr/index.html
// with minor adjustments
precision highp float;

uniform float u_metallicFactor;
uniform float u_roughnessFactor;

varying vec3 v_position;
varying vec3 v_normal; 

#define PI 3.14159265359
#define RECIPROCAL_PI 0.31830988618
#define EPSILON 1e-6
#define DEFAULT_SPECULAR_COEFFICIENT 0.04
#define saturate(a) clamp( a, 0.0, 1.0 )

float pow2(const in float x) { return x*x; }

struct IncidentLight
{
    vec3 color;
    vec3 direction;
};
struct ReflectedLight
{
    vec3 diffuse;
    vec3 specular;
};
struct GeometricContext
{
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};
struct PhysicalMaterial
{
    vec3    diffuseColor;
    float   specularRoughness;
    vec3    specularColor;
};


/////////////////////////////////////////////////////////
//              DIFFUSE BRDF EVALUATION                //
/////////////////////////////////////////////////////////

vec3 BRDF_Diffuse_Lambert(const in vec3 diffuseColor)
{
    return RECIPROCAL_PI * diffuseColor;
}


/////////////////////////////////////////////////////////
//             SPECULAR BRDF EVALUATION                //
/////////////////////////////////////////////////////////

vec3 F_Schlick(const in vec3 specularColor, const in float dotLH)
{
    float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
    return ( 1.0 - specularColor ) * fresnel + specularColor;
}

float G_GGX_Smith(const in float alpha, const in float dotNL, const in float dotNV)
{
    float a2 = pow2( alpha );
    float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
    float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
    return 1.0 / ( gl * gv );
}

float G_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV)
{
    float a2 = pow2( alpha );
    float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
    float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
    return 0.5 / max( gv + gl, EPSILON );
}

float D_GGX(const in float alpha, const in float dotNH)
{
    float a2 = pow2( alpha );
    float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
    return RECIPROCAL_PI * a2 / pow2( denom );
}

vec3 BRDF_Specular_GGX(const in IncidentLight incidentLight,
                       const in GeometricContext geometry,
                       const in vec3 specularColor,
                       const in float roughness             )
{
    float alpha = pow2( roughness );
    vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
    float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
    float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
    float dotNH = saturate( dot( geometry.normal, halfDir ) );
    float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
    
    vec3  F = F_Schlick( specularColor, dotLH );
    float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
    
    return F * (G * D);
}


/////////////////////////////////////////////////////////
//          MAIN LIGHTING COMPUTATION FUNCTION         //
/////////////////////////////////////////////////////////

void computeLighting(const in IncidentLight directLight,
                     const in GeometricContext geometry,
                     const in PhysicalMaterial material,
                     inout ReflectedLight reflectedLight)
{
    float dotNL     = saturate(dot(geometry.normal, directLight.direction));
    vec3 irradiance = dotNL * directLight.color;
    irradiance *= PI;
    
    reflectedLight.specular += irradiance * BRDF_Specular_GGX(directLight,
                                                              geometry,
                                                              material.specularColor,
                                                              material.specularRoughness);
    reflectedLight.diffuse  += irradiance * BRDF_Diffuse_Lambert(material.diffuseColor);
}

/////////////////////////////////////////////////////////
//                  MAIN PROGRAM                       //
/////////////////////////////////////////////////////////
void main()
{
    // light definitions (simple directional lights)
    IncidentLight directLight0;
    directLight0.direction = vec3(0.0, 0.0, 1.0);
    //directLight0.color     = vec3(0.7, 0.7, 0.7);
    directLight0.color     = 0.7 * vec3(1.0, 1.0, 1.0);
    
    IncidentLight directLight1;
    directLight1.direction = vec3(-0.71, 0.71, 0.0);
    //directLight1.color     = vec3(0.5, 0.5, 0.5);
    directLight1.color     = 0.7 * vec3(0.8, 0.6, 1.0);
    
    IncidentLight directLight2;
    directLight2.direction = vec3(0.71, 0.71, 0.0);
    //directLight2.color     = vec3(0.5, 0.5, 0.5);
    directLight2.color     = 0.7 * vec3(1.0, 0.8, 0.6);
    
    // material definition
    
    vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
    float roughnessFactor = u_roughnessFactor;
    float metallicFactor = u_metallicFactor;

    PhysicalMaterial material;                
    material.diffuseColor      = diffuseColor.rgb * ( 1.0 - metallicFactor );
    material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );
    material.specularColor     = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metallicFactor );
    
    // local geometry definition
    GeometricContext geometry;
    geometry.position = v_position;
    geometry.normal   = normalize(v_normal);
    geometry.viewDir  = normalize(-v_position);
    
    // lighting computation
    ReflectedLight reflectedLight = ReflectedLight(
        vec3( 0.0, 0.0, 0.0 ), //diffuse
        vec3( 0.0, 0.0, 0.0 )  //specular
    );
    computeLighting(directLight0, geometry, material, reflectedLight);
    computeLighting(directLight1, geometry, material, reflectedLight);
    computeLighting(directLight2, geometry, material, reflectedLight);

    vec3 outgoingLight = reflectedLight.diffuse + reflectedLight.specular;
    vec4 finalColor = vec4(outgoingLight, diffuseColor.a);
    
    //finalColor.r = u_metallicFactor;
    //finalColor.g = u_roughnessFactor;
    //finalColor.b = 0.0;
    
    gl_FragColor = finalColor;
}
