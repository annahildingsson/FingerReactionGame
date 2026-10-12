# Finger Reaction Game ✋🏼✌🏼☝🏼
## An interactive reaction-based game that combines computer vision, real-time hand gesture recognition and LED signals
#### By Anna Hildingsson & Isabella Katz
#### Created December 2025 - January 2026

## Description
Finger Reaction Game is an interactive reaction-based game that combines computer vision, real-time
gesture recognition, and LED signals. Each LED light on the breadboard represents a specific finger.
When the light is shown, the player must quickly replicate the pattern using their hand. The
camera-based recognition identifies the player’s gesture, evaluates whether it matches the expected
pattern, and updates the player’s score accordingly in the GUI. The project demonstrates a working
prototype that integrates physical components with software-based visual recognition and live
feedback through a dashboard.

## Physical components used in the project
- **Microcontroller: Arduino Uno** - Serves as the embedded controller, managing LED
outputs and communicating with the host computer via USB.
- **Five LEDs (different colors)** - Act as visual cues for the game's finger pattern.
Different colors improve clarity.
- **Camera (built-in laptop camera)** - The camera serves as the primary sensing device
for capturing user hand gestures. It continuously streams visual data to the processing
unit, where computer vision algorithms perform real-time gesture recognition.
- **USB cable and Jumper wires** - The USB cable powers the Arduino Uno and
provides serial communication with the host computer. Jumper wires connect the
LEDs to the Arduino via the breadboard.
- **Breadboard** - Used to assemble the circuit without soldering, allowing rapid
prototyping and easy modification during development.

## Circuit design, software logic and alternative design choices
Five LEDs are connected to individual digital GPIO pins on the Arduino Uno through
resistors to prevent overcurrent and protect both the LEDs and the microcontroller pins. Each
LED represents a specific finger. All LED cathodes are connected to a common ground rail
on the breadboard, while the anodes are connected to the Arduino's digital outputs via jumper
wires. Power is supplied to the circuit through the Arduino Uno’s USB connection, which
also provides a serial communication channel to the host computer.

The system software is divided into two main layers, the embedded firmware running on the
Arduino Uno and the application software running on the host computer. For this project
ESP32 or Arduino Nano could have been used, however the Arduino Uno was ultimately
chosen due to its simplicity, reliability and suitability for rapid prototyping. Since the system
relies on a USB connection and serial communication with the host computer, it was not
necessary to use ESP32 or Arduino Nano which offer wireless connectivity and additional
features that are not required for our prototype.

On the embedded side, the Arduino firmware configures the LED pins as digital outputs and
listens for incoming serial commands from the host system (written in Python code). The
firmware operates in a continuous loop, ensuring real-time responsiveness.
On the host computer, the application software is implemented using Python, Node-RED, and
a web browser. The web browser uses the built-in camera together with MediaPipe to
perform real-time hand tracking and determine which finger is raised. The detected finger
label is then sent via MQTT to the Python game logic. Python evaluates whether the detected
gesture matches the expected pattern, updates the player’s score, and sends LED control
commands to the Arduino via serial communication to display the next LED signal.
Node-RED is used to manage control flow, data flow and visualization. It provides a live
dashboard that displays game state information such as current score, detected gestures and
system feedback in real time.

A custom HTML web interface or a desktop application could have been developed to
visualize the game state. While these options offer greater flexibility and customization,
Node-RED simplifies integration with the Python based gesture recognition and the
Arduino-controlled LEDs, making it a practical choice.

## Technologies used in the project
The project is designed as a distributed system where each part has clearly separated
responsibilities. Each part of the system focuses on a specific task, and communication
between components is handled through a message-based protocol (MQTT). The main
components of the system are:

### Web browser (camera + MediaPipe)
The web browser is responsible for user input and uses the built-in webcam as the primary
sensor to capture the user’s hand movements. MediaPipe is a computer vision framework that
provides real-time hand tracking. It is used to detect the hand from the camera and return key
landmarks of the player's hand, which makes it possible to determine which finger is raised.
All image processing is handled locally in the browser, and a simplified finger label is then
sent to the rest of the system via MQTT.

### Node-RED (dashboard and control logic)
Node-RED is the central communication layer between the user and the system. It does not
contain the core game logic, but is used to provide an interactive graphical user interface,
including start button, score display, status text along with an information box with game
rules. Node-RED sends control commands such as START, and displays feedback received
from the game logic on the dashboard.

### Python (Game Logic Engine)
Python is responsible for managing the game flow and timing. It selects random LEDs and
expected fingers, and evaluates whether the player reacts correctly with a given time window.
Further on, it calculates the score and determines if the player's gesture is a hit or a miss, then
sends status updates and current score back to Node-RED. Python receives input from both
Node-RED (by the game control commands) and the browser (by finger labels via MQTT).

### Arduino (Physical LED control)
Arduino is used as a hardware interface for controlling the five LED lights. The
microcontroller receives commands from Python via serial communication, and turns on or
off a specific LED based on the received command.

### MQTT (Communication layer)
MQTT is used as a communication protocol between all software components. It manages all
the communication through a publish/subscribe model, where components publish messages
to specific topics and other components subscribe to the topics relevant to their functionality.
All messages are routed through a local MQTT broker, which acts as a link between the
different system components.

## Possible real-world applications of the developed prototype
### Hand and finger rehabilitation
The prototype could be adapted for hand and finger rehabilitation by providing exercises that
train reaction time, coordination and fine motor skills. Contactless gesture recognition
combined with immediate visual feedback makes the game suitable for rehabilitation where
repeated training and adjustable difficulty levels are required.

### Extended game and full-body interaction
The prototype could be extended into a larger game, with increased functionality, by
expanding the gesture set or incorporating full-body movements instead of only hand
gestures. In this context, the system could also serve as a training application that promotes
physical activity through gesture-based interaction and real-time feedback.

### Educational tool for children
The prototype could also be used as an educational tool for children learning the names of
their fingers. By combining visual LEDs, physical interaction and instant feedback, the
system encourages learning through engagement and interaction, making it suitable for use in
school or other educational environments.
