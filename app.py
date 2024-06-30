from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/messages', methods=['POST'])
def send_message():
    try:
        message = request.json
        bot_url = 'http://localhost:3978/api/messages'
        response = requests.post(bot_url, json=message)

        if response.status_code == 200:
            bot_response = response.json()
            return jsonify(bot_response)
        else:
            return jsonify({'error': 'Failed to communicate with bot framework'}), response.status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
