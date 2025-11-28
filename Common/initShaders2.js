
    // initShaders2.js 的内容 (已修改，将 alert 换为 console.error)

    // Get a file as a string using  AJAX
    function loadFileAJAX(name) {
        var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open('GET', name, false);
        xhr.send(null);
        return xhr.status == okStatus ? xhr.responseText : null;
    };


    function initShaders(gl, vShaderName, fShaderName) {
        function getShader(gl, shaderName, type) {
            var shader = gl.createShader(type),
                shaderScript = loadFileAJAX(shaderName);
            if (!shaderScript) {
                console.error("Could not find shader source: " + shaderName); // 更改
            }
            gl.shaderSource(shader, shaderScript);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                // *** 核心更改：将 alert 换为 console.error ***
                console.error("Shader compilation error in " + shaderName + ":");
                console.error(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
            fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
            program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Could not initialise shaders"); // 更改
            return null;
        }


        return program;
    };