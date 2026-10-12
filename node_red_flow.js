[
    {
        "id": "d93fd5e8cdf8a72f",
        "type": "tab",
        "label": "Flow 1",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "dcf05d94ba8b8bbc",
        "type": "ui_button",
        "z": "d93fd5e8cdf8a72f",
        "name": "Start Game Round",
        "group": "c86c65dc3544b871",
        "order": 6,
        "width": 6,
        "height": 2,
        "passthru": false,
        "label": "Start",
        "tooltip": "",
        "color": "",
        "bgcolor": "#6a976b",
        "className": "center",
        "icon": "",
        "payload": "START",
        "payloadType": "str",
        "topic": "game/start",
        "topicType": "str",
        "x": 310,
        "y": 440,
        "wires": [
            [
                "a2e68227b3aff1d1"
            ]
        ]
    },
    {
        "id": "a2e68227b3aff1d1",
        "type": "mqtt out",
        "z": "d93fd5e8cdf8a72f",
        "name": "MQTT Out",
        "topic": "",
        "qos": "0",
        "retain": "",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "c147fa549bcd0de7",
        "x": 650,
        "y": 440,
        "wires": []
    },
    {
        "id": "e966557bbd1442ea",
        "type": "mqtt in",
        "z": "d93fd5e8cdf8a72f",
        "name": "Reaktionstid",
        "topic": "reaction/time",
        "qos": "0",
        "datatype": "auto",
        "broker": "c147fa549bcd0de7",
        "inputs": 0,
        "x": 150,
        "y": 540,
        "wires": [
            [
                "1e79c2f34810e168"
            ]
        ]
    },
    {
        "id": "1e79c2f34810e168",
        "type": "function",
        "z": "d93fd5e8cdf8a72f",
        "name": "Count points",
        "func": "var reaction = parseFloat(msg.payload);\nvar points = 0;\n\nif(reaction < 300){\n    points = 3;\n} else if(reaction < 500){\n    points = 2;\n} else {\n    points = 1;\n}\n\nmsg.payload = points;\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 340,
        "y": 540,
        "wires": [
            [
                "e817bd244d8870a0"
            ]
        ]
    },
    {
        "id": "e817bd244d8870a0",
        "type": "ui_gauge",
        "z": "d93fd5e8cdf8a72f",
        "name": "Poäng",
        "group": "8aaacd410886d60b",
        "order": 1,
        "width": 6,
        "height": 7,
        "gtype": "gage",
        "title": "Points",
        "label": "points",
        "format": "{{value}}",
        "min": 0,
        "max": "10",
        "colors": [
            "#6a976b",
            "#69976b",
            "#68976b"
        ],
        "seg1": 1,
        "seg2": 2,
        "diff": false,
        "className": "",
        "x": 540,
        "y": 540,
        "wires": []
    },
    {
        "id": "b86e44318f9a9d5a",
        "type": "inject",
        "z": "d93fd5e8cdf8a72f",
        "name": "",
        "props": [
            {
                "p": "7",
                "v": "",
                "vt": "date"
            },
            {
                "p": "game/score",
                "v": "",
                "vt": "str"
            },
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "game/finger",
        "payload": "hello",
        "payloadType": "str",
        "x": 160,
        "y": 320,
        "wires": [
            [
                "a2e68227b3aff1d1",
                "a58d3b3de8260a37"
            ]
        ]
    },
    {
        "id": "7ad9e0e490a76b1e",
        "type": "mqtt in",
        "z": "d93fd5e8cdf8a72f",
        "name": "",
        "topic": "game/score",
        "qos": "2",
        "datatype": "auto-detect",
        "broker": "c147fa549bcd0de7",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 770,
        "y": 540,
        "wires": [
            [
                "e817bd244d8870a0",
                "7fc598e8d4a69b30"
            ]
        ]
    },
    {
        "id": "bdb9f5432b1e164a",
        "type": "ui_template",
        "z": "d93fd5e8cdf8a72f",
        "group": "c86c65dc3544b871",
        "name": "MediaPipe",
        "order": 1,
        "width": 0,
        "height": 0,
        "format": "<div style=\"position:relative; width:100%; height:100%; min-height:360px;\">\n  <video id=\"cam\" autoplay playsinline muted\n    style=\"width:100%; height:100%; object-fit:cover; border-radius:16px; transform: scaleX(-1);\">\n  </video>\n\n  <canvas id=\"overlay\"\n    style=\"position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; transform: scaleX(-1);\">\n  </canvas>\n\n\n  <div id=\"status\" style=\"position:absolute; left:12px; top:12px; padding:8px 10px; border-radius:10px;\n                          background:rgba(0,0,0,0.45); color:white; font-size:14px;\">\n    Loading MediaPipe...\n  \n  </div>\n  \n</div>\n\n<!-- To hide status text in video -->\n<style>\n  #status {\n    display: none !important;\n  }\n</style>\n\n<script>\n  (function(scope){\n\n  (async function() {\n\n    let countdownText = \"\";\n    scope.$watch(\"msg\", function(msg) {\n      if (!msg) return;\n      if (msg.topic === \"game/status\") {\n        countdownText = String(msg.payload ?? \"\").trim();\n      }\n    });\n\n    function loadScript(src) {\n      return new Promise((resolve, reject) => {\n        const s = document.createElement('script');\n        s.src = src;\n        s.async = true;\n        s.onload = resolve;\n        s.onerror = reject;\n        document.head.appendChild(s);\n      });\n    }\n\n    function classifyRaised(raisedSet) {\n      const arr = Array.from(raisedSet);\n      if (arr.length === 0) return \"none\";\n      if (arr.length === 1) return arr[0];\n      return \"multiple\";\n    }\n\n    function getRaisedFingers(landmarks, handednessLabel) {\n      const tips = { thumb:4, index:8, middle:12, ring:16, pinky:20 };\n      const pips = { thumb:2, index:6, middle:10, ring:14, pinky:18 };\n      const raised = new Set();\n\n      [\"index\",\"middle\",\"ring\",\"pinky\"].forEach(f => {\n        if (landmarks[tips[f]].y < landmarks[pips[f]].y) raised.add(f);\n      });\n\n      const thumbTip = landmarks[tips.thumb];\n      const thumbJoint = landmarks[pips.thumb];\n      if ((handednessLabel || \"\").toLowerCase() === \"right\") {\n        if (thumbTip.x > thumbJoint.x) raised.add(\"thumb\");\n      } else {\n        if (thumbTip.x < thumbJoint.x) raised.add(\"thumb\");\n      }\n      return raised;\n    }\n\n    const video = document.getElementById(\"cam\");\n    const canvas = document.getElementById(\"overlay\");\n    const ctx = canvas.getContext(\"2d\");\n    const statusEl = document.getElementById(\"status\");\n\n    await loadScript(\"https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js\");\n    await loadScript(\"https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js\");\n    await loadScript(\"https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js\");\n\n    statusEl.textContent = \"Starting camera...\";\n\n    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });\n    video.srcObject = stream;\n\n    function resizeCanvasToVideo() {\n      const w = video.videoWidth || 640;\n      const h = video.videoHeight || 480;\n      canvas.width = w;\n      canvas.height = h;\n    }\n\n    const hands = new Hands({\n      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`\n    });\n\n    hands.setOptions({\n      maxNumHands: 1,\n      modelComplexity: 0,\n      minDetectionConfidence: 0.6,\n      minTrackingConfidence: 0.6\n    });\n\n    let lastSent = \"\";\n    let lastSentAt = 0;\n\n    function maybeSendFinger(fingerLabel) {\n      const now = Date.now();\n      fingerLabel = String(fingerLabel).trim().toLowerCase();\n\n      if (fingerLabel !== lastSent && (now - lastSentAt) > 80) {\n        lastSent = fingerLabel;\n        lastSentAt = now;\n        scope.send({ topic: \"game/finger\", payload: fingerLabel });\n      }\n    }\n\n    hands.onResults((results) => {\n      if (!video.videoWidth) return;\n      resizeCanvasToVideo();\n\n      ctx.save();\n      ctx.clearRect(0, 0, canvas.width, canvas.height);\n      \n      //ctx.translate(canvas.width, 0);\n      //ctx.scale(-1, 1); // Spegelvänd\n\n      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {\n        const lm = results.multiHandLandmarks[0];\n        const handedness = results.multiHandedness?.[0]?.label || \"Right\";\n\n        drawConnectors(ctx, lm, HAND_CONNECTIONS, { lineWidth: 3 });\n        drawLandmarks(ctx, lm, { lineWidth: 2 });\n\n        const raised = getRaisedFingers(lm, handedness);\n        const label = classifyRaised(raised);\n\n        statusEl.textContent = `Finger: ${label}`;\n        maybeSendFinger(label);\n      } else {\n        statusEl.textContent = \"Finger: none\";\n        maybeSendFinger(\"none\");\n      }\n\n/*\n      if (countdownText) {\n        const y = canvas.height * 0.9;\n        const paddingX = 28;\n        const paddingY = 18;\n\n        ctx.font = \"bold 52px Arial\";\n        ctx.textAlign = \"center\";\n        ctx.textBaseline = \"middle\";\n\n        const metrics = ctx.measureText(countdownText);\n        const textWidth = metrics.width;\n        const textHeight = 52;\n\n        let boxWidth = textWidth + paddingX * 2;\n        let boxHeight = textHeight + paddingY * 2;\n\n        const maxBoxWidth = canvas.width * 0.95;\n        if (boxWidth > maxBoxWidth) boxWidth = maxBoxWidth;\n\n        const x = canvas.width / 2;\n        const left = x - boxWidth / 2;\n        const top = y - boxHeight / 2;\n\n        ctx.fillStyle = \"rgba(0,0,0,0.6)\";\n        ctx.fillRect(left, top, boxWidth, boxHeight);\n\n        ctx.fillStyle = \"white\";\n        ctx.fillText(countdownText, x, y);\n      }\n      */\n\n      ctx.restore();\n      \n    });\n    \n\n    const camera = new Camera(video, {\n      onFrame: async () => { await hands.send({ image: video }); },\n      width: 640,\n      height: 480\n    });\n\n    statusEl.textContent = \"MediaPipe ready\";\n    camera.start();\n\n  })();\n\n})(scope);\n</script>",
        "storeOutMessages": true,
        "fwdInMessages": true,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "",
        "x": 690,
        "y": 720,
        "wires": [
            [
                "6e3e72674645f119"
            ]
        ]
    },
    {
        "id": "6e3e72674645f119",
        "type": "mqtt out",
        "z": "d93fd5e8cdf8a72f",
        "name": "",
        "topic": "game/finger",
        "qos": "0",
        "retain": "",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "c147fa549bcd0de7",
        "x": 950,
        "y": 720,
        "wires": []
    },
    {
        "id": "6485a37a353055f8",
        "type": "mqtt in",
        "z": "d93fd5e8cdf8a72f",
        "name": "",
        "topic": "game/status",
        "qos": "2",
        "datatype": "auto-detect",
        "broker": "c147fa549bcd0de7",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 490,
        "y": 660,
        "wires": [
            [
                "bdb9f5432b1e164a",
                "7fc598e8d4a69b30"
            ]
        ]
    },
    {
        "id": "a58d3b3de8260a37",
        "type": "debug",
        "z": "d93fd5e8cdf8a72f",
        "name": "debug 1",
        "active": false,
        "tosidebar": true,
        "console": true,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 390,
        "y": 80,
        "wires": []
    },
    {
        "id": "7fc598e8d4a69b30",
        "type": "ui_text",
        "z": "d93fd5e8cdf8a72f",
        "group": "c86c65dc3544b871",
        "order": 2,
        "width": 0,
        "height": 0,
        "name": "",
        "label": "",
        "format": "{{msg.payload}}",
        "layout": "row-left",
        "className": "text",
        "style": false,
        "font": "",
        "fontSize": 16,
        "color": "#000000",
        "x": 1010,
        "y": 620,
        "wires": []
    },
    {
        "id": "0858f4dc6a6adc40",
        "type": "ui_template",
        "z": "d93fd5e8cdf8a72f",
        "group": "139509748e1edcce",
        "name": "Info-Box",
        "order": 1,
        "width": 0,
        "height": 0,
        "format": "<div id=\"game-info\">\n    <div class=\"section-title\">About the game</div>\n    <ol>\n        <li>This reaction game uses your webcam and hand tracking to check if you show the correct finger within a given time window\n        when the lamp turns on.</li>\n    </ol>\n\n    <div class=\"section-title\">How to play</div>\n    <ol>\n        <li>Click <strong>\"Start\"</strong> to begin the game.</li>\n        <li>When the lamp turns ON, raise the corresponding finger.</li>\n        <li>If you raise the correct finger, your score increases.</li>\n        <li>If you raise the wrong finger, your score decreases.</li>\n        <li>Try to get the best score!</li>\n    </ol>\n</div>\n<style>\n    #game-info {\n    background: #5c835d;\n    width: 280px;\n    padding: 20px;\n    border-radius: 14px;\n    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);\n    font-size: 16px;\n    color: white;\n    }\n    \n    #game-info ol, #game-info li {\n    line-height: 1.5;\n    color: inherit;\n    }\n    \n    .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 8px;\n    }\n</style>",
        "storeOutMessages": true,
        "fwdInMessages": true,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "",
        "x": 140,
        "y": 760,
        "wires": [
            []
        ]
    },
    {
        "id": "9f7598657daa91b3",
        "type": "ui_template",
        "z": "d93fd5e8cdf8a72f",
        "group": "c86c65dc3544b871",
        "name": "",
        "order": 4,
        "width": 0,
        "height": 0,
        "format": "<style>\n    .text {\n        font-size: 30px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n    }\n</style>",
        "storeOutMessages": true,
        "fwdInMessages": true,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "text",
        "x": 1160,
        "y": 620,
        "wires": [
            []
        ]
    },
    {
        "id": "5ce24daafa97456c",
        "type": "ui_template",
        "z": "d93fd5e8cdf8a72f",
        "group": "c86c65dc3544b871",
        "name": "",
        "order": 3,
        "width": 0,
        "height": 0,
        "format": "<style>\n    .center {\n        display: block;\n        margin: 0 auto;\n        align-items: center;\n    }\n</style>",
        "storeOutMessages": true,
        "fwdInMessages": true,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "center",
        "x": 120,
        "y": 440,
        "wires": [
            []
        ]
    },
    {
        "id": "75cf318fcc3b81bf",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "c86c65dc3544b871",
        "order": 5,
        "width": 3,
        "height": 1
    },
    {
        "id": "71e26202ef71f4a1",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "c86c65dc3544b871",
        "order": 7,
        "width": 3,
        "height": 1
    },
    {
        "id": "0529f3e682dedcb2",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "c86c65dc3544b871",
        "order": 8,
        "width": 3,
        "height": 1
    },
    {
        "id": "677c36cb9fa1c1cc",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "c86c65dc3544b871",
        "order": 9,
        "width": 3,
        "height": 1
    },
    {
        "id": "1d1f08d9f8701d61",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "8aaacd410886d60b",
        "order": 3,
        "width": 1,
        "height": 1
    },
    {
        "id": "dbf5a4f80bd4c7d1",
        "type": "ui_spacer",
        "z": "d93fd5e8cdf8a72f",
        "name": "spacer",
        "group": "8aaacd410886d60b",
        "order": 3,
        "width": 1,
        "height": 1
    },
    {
        "id": "c86c65dc3544b871",
        "type": "ui_group",
        "name": "",
        "tab": "cd7043fa07961160",
        "order": 2,
        "disp": true,
        "width": "12",
        "collapse": false,
        "className": ""
    },
    {
        "id": "c147fa549bcd0de7",
        "type": "mqtt-broker",
        "name": "Local MQTT",
        "broker": "localhost",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": 4,
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    },
    {
        "id": "8aaacd410886d60b",
        "type": "ui_group",
        "name": "",
        "tab": "cd7043fa07961160",
        "order": 3,
        "disp": true,
        "width": "6",
        "collapse": false,
        "className": ""
    },
    {
        "id": "139509748e1edcce",
        "type": "ui_group",
        "name": "",
        "tab": "cd7043fa07961160",
        "order": 1,
        "disp": true,
        "width": "7",
        "collapse": false,
        "className": ""
    },
    {
        "id": "cd7043fa07961160",
        "type": "ui_tab",
        "name": "WELCOME TO FINGER REACTION GAME",
        "icon": "dashboard",
        "order": 1,
        "disabled": false,
        "hidden": false
    },
    {
        "id": "adc84a68efd179ea",
        "type": "global-config",
        "env": [],
        "modules": {
            "node-red-dashboard": "3.6.6"
        }
    }
]