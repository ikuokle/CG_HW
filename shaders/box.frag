#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength,shininess;

in vec3 Normal;//法向量
in vec3 FragPos;//相机观察的片元位置
in vec2 TexCoord;//纹理坐标
in vec4 FragPosLightSpace;//光源观察的片元位置

uniform vec3 viewPos;//相机位置
uniform vec4 u_lightPosition; //光源位置	
uniform vec3 lightColor;//入射光颜色

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture; // Shadow Map
uniform samplerCube cubeSampler;//盒子纹理采样器


float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir)
{
    float shadow = 0.0;
    /*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
    
    // 1. NDC坐标
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // 映射到 [0, 1] 范围的纹理坐标
    vec2 lightTexCoords = projCoords.xy * 0.5 + 0.5;
    
    // 2. 边界检查和深度图采样
    if(projCoords.z > 1.0)
        return 0.0;
        
    float closestDepth = texture(depthTexture, lightTexCoords).r;
    float currentDepth = projCoords.z;
    
    // 3. 硬阴影判定
    const float bias = 0.005; 
    
    if (currentDepth - bias > closestDepth) {
        shadow = 1.0; // 是阴影
    } else {
        shadow = 0.0; // 不是阴影
    }

    return shadow;
}

void main()
{
    
    //采样纹理颜色
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

    //计算光照颜色
	vec3 norm = normalize(Normal);
	vec3 lightDir;
    // 根据光源类型确定光线方向
	if(u_lightPosition.w == 1.0)	
        lightDir = normalize(u_lightPosition.xyz - FragPos);
	else lightDir = normalize(u_lightPosition.xyz);
    
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 halfDir = normalize(viewDir + lightDir);


    /*TODO2:根据phong shading方法计算ambient,diffuse,specular*/
    vec3  ambient,diffuse,specular;
    
    // 环境光 (Ambient)
    ambient = ambientStrength * lightColor;

    // 漫反射 (Diffuse)
    float diff = max(dot(norm, lightDir), 0.0);
    diffuse = diffuseStrength * lightColor * diff;

    // 镜面反射 (Specular) - 使用 Blinn-Phong 模型
    float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
    specular = specularStrength * lightColor * spec;
    
	vec3 lightReflectColor = (ambient + diffuse + specular);

    //判定是否阴影，并对各种颜色进行混合
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
	
    // 基础颜色计算 (光照 + 阴影 + 纹理)
    vec3 resultColor = (1.0 - shadow / 2.0) * lightReflectColor * TextureColor;
    
    
    // ===================================
    // 【加强项：场景的雾化效果 - 参数调整】
    // ===================================
    
    // 雾的参数
    const vec3 fogColor = vec3(0.5, 0.5, 0.5); // 灰色雾气
    const float fogStart = 5.0;               // 【调整】雾气开始的距离
    const float fogEnd = 30.0;                // 【调整】雾气完全遮蔽的距离

    // 1. 计算片元到摄像机的距离
    float distance = length(viewPos - FragPos);

    // 2. 计算雾因子 (线性雾)
    float fogFactor = (fogEnd - distance) / (fogEnd - fogStart);
    
    // 3. 限制雾因子在 [0, 1] 范围内
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    // 4. 混合最终颜色和雾色
    vec3 finalColor = mix(fogColor, resultColor, fogFactor);

    // ===================================

    FragColor = vec4(finalColor, 1.0);
}