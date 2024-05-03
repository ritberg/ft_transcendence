# import pygame
# import sys
import tensorflow as tf
import numpy as np
import asyncio
import time
import random
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class Consumer(AsyncWebsocketConsumer):

    async def receive(self, received_data):
        data = json.loads(received_data)
        ai.save_data(data["player"], data["computer"], data["ballX"], data["ballY"]) # update coordinates after training
        move = ai.predict_move()
        print("Return of predict_move():", move)
        # ai_update(move)
        await self.send(
            {"predict" : move}
        )
    
    update_lock = asyncio.Lock()

    async def connect(self):
        await self.accept()


# to improve all this and to do RL, I should save moments when the ball touches a paddle and mark it as successful.
# now it's not RL. It's just a prediction
class AI:
    def __init__(self):
        self.previous_data = None
        self.training_data = [[], [], []]
        self.last_data_object = None
        # self.flip_table = True  # Assuming this variable controls whether to flip the table or not

        # Define the model (small model with 16 or 4 - to test)
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(16, input_shape=(8,), activation='relu'),
            #tf.keras.layers.Dense(512, activation='relu'),
            #tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dense(3)  # Output layer for 3 possible actions
        ])
        self.model.compile(loss='mean_squared_error', optimizer=tf.keras.optimizers.Adam(learning_rate=0.001))
        # Adam is an optimization algorithm
        # if loss is small, the model learns well

# / canvas_height or canvas_width - because without this the prediction values are too big
    def save_data(self, player_y, computer_y, ball_x, ball_y):
        print("Player Y:", player_y)
        print("Computer Y:", computer_y)
        print("Ball X:", ball_x)
        print("Ball Y:", ball_y)
        if self.previous_data is None:
            self.previous_data = [player_y / canvas_height, computer_y / canvas_height, ball_x / canvas_width, ball_y / canvas_height]
            return

        # if self.flip_table:
        # data_xs = [canvas_height - computer_y, canvas_height - player_y, canvas_width - ball_x, canvas_height - ball_y]
        # else:
        data_xs = [player_y / canvas_height, computer_y / canvas_height, ball_x / canvas_width, ball_y / canvas_height]

        self.last_data_object = self.previous_data + data_xs

        index = 0 if computer_y / canvas_height < self.previous_data[1] else (1 if computer_y / canvas_height == self.previous_data[1] else 2)
        self.training_data[index].append(self.last_data_object)
        # print("Training data for action 0:", self.training_data[0])
        # print("Training data for action 1:", self.training_data[1])
        # print("Training data for action 2:", self.training_data[2])

        self.previous_data = data_xs

        # Prepare data to save into a JSON file
        # data_to_save = {
        #     "xs": data_xs,
        #     "ys": data_ys,
        # }
        
        # file_path = "data.json"

        # # Write data to the JSON file
        # with open(file_path, "w") as json_file:
        #     json.dump(data_to_save, json_file)
        

    def train(self):
        # len_data = min(len(self.training_data[0]), len(self.training_data[1]), len(self.training_data[2]))
        # print("Length of training data for action 0:", len(self.training_data[0]))
        # print("Length of training data for action 1:", len(self.training_data[1]))
        # print("Length of training data for action 2:", len(self.training_data[2]))
        # if len_data == 0:
        #     print('Nothing to train')
        #     return

        data_xs = []
        data_ys = []
        for i in range(3):
            data_xs += self.training_data[i]#[:len_data]
            data_ys += [[1 if i == j else 0 for j in range(3)]] * len(self.training_data[i])

        xs = tf.convert_to_tensor(data_xs, dtype=tf.float32)
        xs += tf.random.normal(xs.shape) / 5   # add gaussian noise because the data is perfect otherwise - risk of overfitting
        ys = tf.convert_to_tensor(data_ys, dtype=tf.float32)
        ys += tf.random.normal(ys.shape) / 5

        # print(xs)
        # print(ys)
        self.model.fit(xs, ys, epochs=100, verbose=1) # the model is trained in epochs, no matter how many frames

    def predict_move(self):
        if self.last_data_object is not None:
            prediction = self.model.predict(np.array([self.last_data_object]))
            print("Prediction:", prediction)
            return np.argmax(prediction) - 1
        


# Initialize pygame
# pygame.init()

# Set up the canvas
canvas_width = 1000
canvas_height = 500
# canvas = pygame.display.set_mode((canvas_width, canvas_height))
# pygame.display.set_caption('Pong')

# # Set up colors
# BLACK = (0, 0, 0)
# WHITE = (255, 255, 255)

# Width and height of the paddles, size of the ball, speed of the paddles
paddle_width = 10
paddle_height = 80
ball_size = 10
paddle_speed = 5

# Paddles are initially centered vertically, ball is initially centered both vertically and horizontally
global player1_y, computer_y
player1_y = canvas_height / 2 - paddle_height / 2
computer_y = canvas_height / 2 - paddle_height / 2
ball_x = canvas_width / 2
ball_y = canvas_height / 2
ball_speed_x = 5 #random.uniform(4, 5)
ball_speed_y = 5 

# player1_score = 0
# computer_score = 0

# clock = pygame.time.Clock()

# def draw_rect(x, y, width, height, color):
#     pygame.draw.rect(canvas, color, pygame.Rect(x, y, width, height))

# def draw_circle(x, y, radius, color):
#     pygame.draw.circle(canvas, color, (x, y), radius)

# def draw_net():
#     for i in range(0, canvas_height, 15):
#         draw_rect(canvas_width / 2 - 1, i, 2, 10, WHITE)

# def draw():
#     # Clear the canvas
#     canvas.fill(BLACK)

#     # Draw paddles
#     draw_rect(0, player1_y, paddle_width, paddle_height, WHITE)
#     draw_rect(canvas_width - paddle_width, computer_y, paddle_width, paddle_height, WHITE)

#     # Draw ball
#     draw_circle(ball_x, ball_y, ball_size, WHITE)

#     # Draw net
#     draw_net()

    # # Draw scores
    # font = pygame.font.SysFont(None, 30)
    # text = font.render(str(player1_score), True, WHITE)
    # canvas.blit(text, (canvas_width / 4, 50))
    # text = font.render(str(computer_score), True, WHITE)
    # canvas.blit(text, ((3 * canvas_width) / 4, 50))


def autonomous_player(ball_y, paddle_y, paddle_speed):
    if ball_y < paddle_y + paddle_height / 2:
        paddle_y -= paddle_speed
    elif ball_y > paddle_y + paddle_height / 2:
        paddle_y += paddle_speed
    return paddle_y


ai = AI()

# def ai_update(move):
#     global computer_y
#     next_y = computer_y + 4 * move

#     # Check if the next position of the paddle exceeds the canvas boundaries
#     if 0 <= next_y <= canvas_height - paddle_height:
#         # If within bounds, update the paddle's position
#         computer_y = next_y
#     else:
#         # If out of bounds, clamp the paddle's position to stay within the canvas boundaries
#         if next_y < 0:
#             computer_y = 0  # Clamp to the top boundary
#         else:
#             computer_y = canvas_height - paddle_height  # Clamp to the bottom boundary

# Game loop
running = True
frame_counter = 0  # Counter to track frames
prev_second = -1
while running:
    # for event in pygame.event.get():
    #     if event.type == pygame.QUIT:
    #         running = False

    # Move paddles
    # keys = pygame.key.get_pressed()
    # if keys[pygame.K_w] and player1_y > 0:
    #     player1_y -= paddle_speed
    # if keys[pygame.K_s] and player1_y < canvas_height - paddle_height:
    #     player1_y += paddle_speed


# it was necessary to distinguish between 1) save data, 2) train the model, 3) predict moves
    current_second = time.localtime().tm_sec
    if frame_counter < 5000:
        print(current_second)
        player1_y = autonomous_player(ball_y, player1_y, paddle_speed)
        computer_y = autonomous_player(ball_y, computer_y, paddle_speed)
        # if current_second != prev_second: # Save game data each second
        #     prev_second = current_second
        ai.save_data(player1_y, computer_y, ball_x, ball_y)
        print("Frame Counter:", frame_counter)

    elif frame_counter == 5000:
        ai.train()

    else:
        break; 

    
    frame_counter += 1


    # Move ball
    ball_x += ball_speed_x
    ball_y += ball_speed_y

    # Ball collisions
    if ball_y <= 0 or ball_y >= canvas_height - ball_size:
        ball_speed_y = -ball_speed_y

    if ball_x <= 0:
        # computer_score += 1
        ball_x = canvas_width / 2
        ball_y = canvas_height / 2
        ball_speed_x = -ball_speed_x

    if ball_x >= canvas_width:
        # player1_score += 1
        ball_x = canvas_width / 2
        ball_y = canvas_height / 2
        ball_speed_x = -ball_speed_x

    # Paddle collisions
    if (ball_x <= paddle_width and player1_y <= ball_y <= player1_y + paddle_height) or \
            (ball_x >= canvas_width - paddle_width - ball_size and
             computer_y <= ball_y <= computer_y + paddle_height):
        ball_speed_x = -ball_speed_x + random.uniform(-3, 0) #???

    # Draw everything
#     draw()
#     pygame.display.flip()
#     clock.tick(60) # draw 60 frames per second on the screen 

# pygame.quit()
# sys.exit()
