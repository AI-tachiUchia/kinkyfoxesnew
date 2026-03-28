from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Safety settings - disable content filtering
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


model = genai.GenerativeModel("gemini-2.0-flash-lite",safety_settings=safety_settings)

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_suggestions', methods=['POST'])
def generate_suggestions():
    data = request.get_json()
    scenario = data.get('scenario')
    
    if not scenario:
        return jsonify({'error': 'No scenario provided'}), 400

    try:
        prompt = f"""Based on this game idea: "{scenario}"

Analyze what the user wants and suggest 3-5 specific game rules, setup requirements, or refinements that would make this game more engaging and fun for a couple.

Format your response as a JSON array of suggestions. Each suggestion should have:
- "title": A short title (3-5 words)
- "description": A detailed description of the suggestion
- "default": The suggested default value or rule

Example format:
[
  {{"title": "Materials Needed", "description": "What items do you need for this game?", "default": "Paper and pen for each person"}},
  {{"title": "Time Limit", "description": "How long should each round last?", "default": "5 minutes per round"}},
  {{"title": "Scoring System", "description": "How do you determine a winner?", "default": "Most creative answer wins"}}
]

Provide ONLY the JSON array, no other text."""

        response = model.generate_content(prompt)
        # Extract JSON from response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        return jsonify({'suggestions': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_game', methods=['POST'])
def generate_game():
    data = request.get_json()
    scenario = data.get('scenario')
    approved_suggestions = data.get('suggestions', [])
    
    if not scenario:
        return jsonify({'error': 'No scenario provided'}), 400

    try:
        # Build context from approved suggestions
        context = ""
        if approved_suggestions:
            context = "\n\nZusätzliche Details:\n"
            for sug in approved_suggestions:
                context += f"- {sug['title']}: {sug['value']}\n"
        
        prompt = f"""Du bist eine API für ein kreatives, ausgefallenes, unzüchtiges Paar-Spiel. Deine Aufgabe ist es, basierend auf dem User-Input genau 8-12 spielbare Karten zu generieren.

Regeln:
- Kurze Einleitungen oder Erklärungen
- Antworte AUSSCHLIESSLICH im JSON-Format
- Halte die Texte kurz (max. 2-3 Sätze pro Aufgabe)
- Variiere die Typen (Task, Dare, Talk, Question)
- Mache es spielbar und konkret

User Input: "{scenario}"{context}

Erwartetes JSON-Format:
[
  {{"title": "Kurzer Titel", "type": "Task", "content": "Konkrete Anweisung", "duration": "3 min"}},
  {{"title": "Kurzer Titel", "type": "Dare", "content": "Konkrete Herausforderung", "duration": "5 min"}},
  {{"title": "Kurzer Titel", "type": "Talk", "content": "Gesprächsthema", "duration": "10 min"}},
  {{"title": "Kurzer Titel", "type": "Question", "content": "Frage zum Beantworten", "duration": "2 min"}}
]

Antworte NUR mit dem JSON-Array, kein anderer Text."""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        return jsonify({'cards': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@app.route('/send_email', methods=['POST'])
def send_email():
    data = request.get_json()
    recipient_email = data.get('email')
    cards = data.get('cards')
    scenario = data.get('scenario')

    if not recipient_email or not cards:
        return jsonify({'error': 'Missing email or cards'}), 400

    # SMTP Configuration
    smtp_server = os.environ.get('MAIL_SERVER')
    smtp_port = os.environ.get('MAIL_PORT')
    smtp_username = os.environ.get('MAIL_USERNAME')
    smtp_password = os.environ.get('MAIL_PASSWORD')
    smtp_use_tls = os.environ.get('MAIL_USE_TLS') == 'True'
    sender_email = os.environ.get('MAIL_DEFAULT_SENDER', smtp_username)

    if not all([smtp_server, smtp_port, smtp_username, smtp_password]):
        return jsonify({'error': 'SMTP configuration missing in .env'}), 500

    try:
        # Create Email Content
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"Deine Kinky Foxes Karten: {scenario[:30]}..."

        # HTML Body
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .card {{ background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 5px solid #ff6b35; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .card-title {{ color: #333; margin-top: 0; }}
                .card-type {{ display: inline-block; padding: 3px 8px; border-radius: 4px; color: white; font-size: 0.8em; font-weight: bold; margin-bottom: 5px; }}
                .footer {{ margin-top: 20px; font-size: 0.8em; color: #777; }}
            </style>
        </head>
        <body>
            <h2>🦊 Deine Kinky Foxes Karten</h2>
            <p>Hier sind die Karten für euer Spiel: <strong>{scenario}</strong></p>
            
            <div class="cards-container">
        """

        type_colors = {
            'Task': '#ff6b35',
            'Dare': '#f7931e',
            'Talk': '#4ecdc4',
            'Question': '#95e1d3'
        }

        for card in cards:
            color = type_colors.get(card.get('type'), '#ff6b35')
            html_body += f"""
                <div class="card" style="border-left-color: {color}">
                    <div class="card-type" style="background-color: {color}">{card.get('type')}</div>
                    <h3 class="card-title">{card.get('title')}</h3>
                    <p>{card.get('content')}</p>
                    <small>⏱️ {card.get('duration')}</small>
                </div>
            """

        html_body += """
            </div>
            <div class="footer">
                <p>Viel Spaß beim Spielen! <br> Generiert mit Kinky Foxes.</p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, 'html'))

        # Send Email
        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            if smtp_use_tls:
                server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)

        return jsonify({'message': 'Email sent successfully'})

    except Exception as e:
        print(f"Email Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
