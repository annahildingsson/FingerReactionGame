'''
Docstring for finger_reaction_game

Finger Reaction Game is an interactive reaction-based game that combines computer vision, 
real-time gesture recognition, and LED signals.

Authors:
Anna Granberg & Isabella Katz
2026-01-06
'''
import time
import random
import threading
import serial
import paho.mqtt.client as mqtt

# -------------------- CONFIG --------------------
MQTT_BROKER_HOST = "localhost"
MQTT_PORT = 1883

# MQTT topics
TOPIC_START = "game/start"       # Node-RED PLAY-button "Start Game Round"
TOPIC_FINGER = "game/finger"     # Browser (MediaPipe) -> "thumb/index/middle/ring/pinky/none/multiple"
TOPIC_SCORE = "game/score"       # Node-RED: score output
TOPIC_STATUS = "game/status"     # Node-RED: status text

#Arduino serial port
SERIAL_PORT = "COM3"
SERIAL_BAUDRATE = 9600

#LED lights mapping (0..4 = )
LED_COUNT = 5
LED_TO_FINGER = ["thumb", "index", "middle", "ring", "pinky"]  

# Game settings
GAME_DURATION = 30.0          # seconds per round
RESPONSE_WINDOW = 2.0         # seconds the player has to respond
BETWEEN_ROUNDS = 0.4          # pause between LEDs
PRE_DELAY_RANGE = (0.8, 2.0)  # random waiting time before the next LED lights up

# Scoring
SCORE_HIT = 1
SCORE_MISS = -1


class FingerReactionGame:
    def __init__(self):
        # Initialize serial connection, MQTT client, and game state
        self.score = 0
        self.current_finger = "none"
        self.is_round_active = False
        self.stop_flag = False

        # Serial connection to Arduino (LED control)
        # Opens the COM-port and communicates with Arduino (LED-kontroll)
        self.ser = serial.Serial(SERIAL_PORT, SERIAL_BAUDRATE, timeout=1)
        time.sleep(2) # allow Arduino reset after opening port

        self.mqtt = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.mqtt.on_connect = self.on_connect
        self.mqtt.on_message = self.on_message

        self.mqtt.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
        self.mqtt.loop_start()

        # Initial dashcoard state
        self.publish(TOPIC_SCORE, str(self.score))
        self.publish(TOPIC_STATUS, "Ready (press PLAY)")

    # MQTT-helper
    def publish(self, topic, payload):
        self.mqtt.publish(topic, payload)

    def on_connect(self, client, userdata, flags, reason_code, properties=None):
        client.subscribe(TOPIC_START)
        client.subscribe(TOPIC_FINGER)

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode(errors="ignore").strip()

        # Finger från MediaPipe
        if topic == TOPIC_FINGER:
            #self.current_finger = payload.strip().lower()
            #return
            #TESTAR DEBUGGA FÖR ATT SE OM NODE-RED SKICKAR FINGER TILL MQQT
            clean = payload.strip().lower()
            print("FINGER RX:", repr(payload), "=>", clean)
            self.current_finger = clean
            return

        # Start/stop/reset-kommandon (Från node-red play) --> endast start implementerad
        if topic == TOPIC_START:
            cmd = payload.strip().upper()
            if cmd in ("START", "PLAY"): 
                self.start_round()
            elif cmd == "STOP": # implementer i node-red
                self.stop_flag = True
            elif cmd == "RESET": # implementer i node-red
                self.reset()

    # -------------------- ARDUINO COMMUNICATION --------------------
    def send_arduino(self, text):
        # Send a single command line to Arduino over serial.
        self.ser.write((text + "\n").encode())

    def all_off(self):
        # Turn off all LEDs.
        self.send_arduino("ALL_OFF")

    def led_on(self, idx):
        # Turn on a specific LED by index (0..LED_COUNT-1)
        self.send_arduino(f"LED:{idx};ON")

    def led_off(self, idx):
        # Turn off a specific LED by index (0..LED_COUNT-1)
        self.send_arduino(f"LED:{idx};OFF")

    # -------------------- GAME CONTROLS --------------------
    def reset(self):
        # Reset score and dashboard state, and turn of LEDs.
        self.score = 0
        self.publish(TOPIC_SCORE, "0")
        self.publish(TOPIC_STATUS, "Reset (press PLAY)")
        self.all_off()

    def start_round(self):
        # Start a new game round in a background thread (if not already running)
        if self.is_round_active:
            return
        
        self.stop_flag = False
        self.is_round_active = True # to prevent double start from rapid clicks
        threading.Thread(target=self.run_round, daemon=True).start()

    # The main game session loop:
    #
    # - Runs for GAME_DURATION seconds (30 sec). Each cycle:
    # - Wait random delay
    # - Choose random LED/finger target
    # - Light LED and prompt player
    # - Evaluate gesture within RESPONSE_WINDOW  (2 sec)
    # - Updates score and dashboard via MQTT
    def run_round(self):
        self.is_round_active = True
        self.score = 0
        self.publish(TOPIC_SCORE, "0")
        self.publish(TOPIC_STATUS, "Game started!")
        start_time = time.time()

        try:
            while not self.stop_flag:
                if time.time() - start_time >= GAME_DURATION:
                    break
                
                # Random pre-delay before next LED lights up
                time.sleep(random.uniform(*PRE_DELAY_RANGE))

                # Choose LED + expected finger
                led = random.randint(0, LED_COUNT - 1)
                expected = LED_TO_FINGER[led]

                # Light up LED and ask the player to show a certain finger
                self.all_off()
                self.led_on(led)
                self.publish(TOPIC_STATUS, f"Show: {expected}")

                # evaluate response --> HIT or MISS
                result = self.evaluate(expected, RESPONSE_WINDOW)

                # turn off LED
                self.led_off(led)

                # scoring + status
                if result == "HIT":
                    self.score += SCORE_HIT
                    self.publish(TOPIC_STATUS, f"Hit! +{SCORE_HIT}")
                else:
                    self.score += SCORE_MISS
                    self.publish(TOPIC_STATUS, f"Miss! {SCORE_MISS}")

                # Update score
                self.publish(TOPIC_SCORE, str(self.score))
                
                # Wait before next round
                time.sleep(BETWEEN_ROUNDS)

        finally:
            self.all_off()
            self.publish(TOPIC_STATUS, f"Game over! Score: {self.score}")
            self.is_round_active = False
            self.stop_flag = False

    def evaluate(self, expected, timeout_sec):
        #   Hit detection function: 
        # Evaluate whether the player shows the expected finger within timeout.
        # Uses a "stability filter":
        # Requires "required_matches" matches to count as HIT.
        # If a wrong single-finger label persists for mismatch_limit ticks, count as MISS early.
        # Ignore transient 'none'/'multiple' labels for mismatch counting.
        
        #   Args:
        # expected_finger: The required finger label (e.g. "thumb").
        # timeout_sec: Maximum time to wait for a correct response.
        
        #   Returns: 
        # HIT = correct finger, 
        # MISS = wrong finger/ too slow
        
        end = time.time() + timeout_sec

        required_matches = 3      # required matches in a row to count as HIT
        match_streak = 0

        wrong_streak = 0
        wrong_limit = 8      # wrong single-finger label persists for 8 * 0.02 sec --> Count as MISS directly.

        while time.time() < end:
            f = self.current_finger

            if f == expected:
                match_streak += 1
                wrong_streak = 0
                if match_streak >= required_matches:
                    return "HIT"
            else:
                match_streak = 0

                # Counts as MISS only if räkna bara "fel" om det är ett enskilt finger (inte none/multiple)
                if f in ("thumb", "index", "middle", "ring", "pinky") and f != expected:
                    wrong_streak += 1
                    if wrong_streak >= wrong_limit:
                        return "MISS"
                else:
                    wrong_streak = 0

            # Checking which finger every 0.02 sec = 50 times/sec
            time.sleep(0.02)

        return "MISS"

    def loop(self):
        # Keep the loop alive while MQTT runs in the background.
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.all_off()
            self.publish(TOPIC_STATUS, "Stopped")
        
if __name__ == "__main__":
    game = FingerReactionGame()
    game.loop()