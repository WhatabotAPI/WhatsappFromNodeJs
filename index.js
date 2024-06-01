const WebSocket = require('ws');
const https = require('https');

class WhatabotRealtimeClient {
    constructor() {
        this.apiKey = "YOUR_API_KEY";
        this.chatId = "YOUR_PHONE_NUMBER";
        this.url = "wss://api.whatabot.io/realtimeMessages";
        this.connectMessage = JSON.stringify({"protocol": "json", "version": 1}) + '\u001e';
    }

    async runWebSocket() {
        while (true) {
            try {
                const ws = new WebSocket(this.url, {
                    headers: {
                        "x-api-key": this.apiKey,
                        "x-chat-id": this.chatId,
                        "x-platform": "whatsapp"
                    },
                    perMessageDeflate: false // Disable compression
                });

                await new Promise((resolve, reject) => {
                    ws.on('open', () => {
                        ws.send(this.connectMessage);
                        console.log("Connected");
                        resolve();
                    });
                    ws.on('error', reject);
                });

                ws.on('message', async (message) => {
                    await this.receiveMessage(ws, message);
                });

                await new Promise((resolve) => {
                    ws.on('close', () => {
                        console.log("Connection closed");
                        resolve();
                    });
                });
            } catch (error) {
                console.log("ERROR:", error);
            }

            console.log("Attempting to reconnect...");
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
    }

    async receiveMessage(ws, message) {
        try {
            message = message.toString().replace(/\u001e+$/, '');
            const jsonMessage = JSON.parse(message);
            const argumentsArray = jsonMessage.arguments;
            const messageTarget = jsonMessage.target;

            if (messageTarget === "ReceiveMessage" && argumentsArray) {
                const textInsideArguments = argumentsArray[0];
                if (textInsideArguments) {
                   
				   const upperText = textInsideArguments.toUpperCase();
                  
				    // Here you can create your functions
                    if (upperText === "START") {
                        console.log("Starting the process...");
                    } else if (upperText === "STOP") {
                        console.log("Stopping the process...");
                    } else if (upperText === "PAUSE") {
                        console.log("Pausing the process...");
                    } else if (upperText === "RESUME") {
                        console.log("Resuming the process...");
                    } else {
                        console.log("Unknown command");
                    }

                    const responseMessage = JSON.stringify({"type": 1, "target": "SendMessage", "arguments": [`Pong: ${textInsideArguments}`]}) + '\u001e';
                    ws.send(responseMessage);
                    console.log("Message sent:", `Pong: ${textInsideArguments}`);
                }
            }
        } catch (error) {
            console.log("Error:", error);
        }
    }
}

async function main() {
    const client = new WhatabotRealtimeClient();
    await client.runWebSocket();
}

main().catch(console.error);
