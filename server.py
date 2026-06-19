#!/usr/bin/env python
"""
Master Flask Server - Unified Frontend + Backend
Combines AI System API + Chatbot + Static Frontend
"""

import os
import json
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from datetime import datetime
import traceback

# Try to import AI system components
try:
    from ai_system import AgriculturalAISystem, create_api_app
    AI_AVAILABLE = True
    print("[OK] AI System loaded")
except Exception as e:
    AI_AVAILABLE = False
    print(f"[WARN] AI System not available: {e}")

# Try to import chatbot components
try:
    from groq import Groq
    from gtts import gTTS
    CHATBOT_AVAILABLE = True
    print("[OK] Chatbot components loaded")
except Exception as e:
    CHATBOT_AVAILABLE = False
    print(f"[WARN] Chatbot not available: {e}")


# Create main Flask app
app = Flask(__name__, 
    static_folder='.',
    static_url_path='',
    template_folder='.'
)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'webm', 'wav', 'mp3', 'm4a', 'jpg', 'jpeg', 'png', 'gif'}

# Create upload folders
Path(app.config['UPLOAD_FOLDER']).mkdir(parents=True, exist_ok=True)
Path('uploads/analysis').mkdir(parents=True, exist_ok=True)

# Initialize AI System if available
if AI_AVAILABLE:
    try:
        ai_system = AgriculturalAISystem()
        print("✓ AI System initialized")
    except Exception as e:
        print(f"⚠ Failed to initialize AI System: {e}")
        AI_AVAILABLE = False

# Initialize Chatbot if available
if CHATBOT_AVAILABLE:
    try:
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set. Please set it before running the server.")
        groq_client = Groq(api_key=groq_api_key)
        print("✓ Chatbot initialized")
    except Exception as e:
        print(f"⚠ Failed to initialize Chatbot: {e}")
        CHATBOT_AVAILABLE = False


# =====================
# FRONTEND ROUTES
# =====================

@app.route('/')
def index():
    """Home page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    if filename.endswith('.html'):
        return send_from_directory('.', filename)
    elif filename.startswith('css/'):
        return send_from_directory('css', filename.replace('css/', ''))
    elif filename.startswith('js/'):
        return send_from_directory('js', filename.replace('js/', ''))
    elif filename.startswith('data/'):
        return send_from_directory('data', filename.replace('data/', ''))
    return send_from_directory('.', filename)


# =====================
# AI SYSTEM API ROUTES
# =====================

@app.route('/api/analyze', methods=['POST'])
def analyze_waste():
    """Analyze waste from uploaded image"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads/analysis', filename)
        file.save(filepath)

        quantity = float(request.form.get('quantity', 1000))
        waste_type = request.form.get('waste_type', None)

        # Run AI analysis
        analysis = ai_system.analyze_waste_complete(filepath, waste_type, quantity)
        
        # Save to results
        save_analysis_result(analysis, filename)
        
        return jsonify(analysis), 200
    
    except Exception as e:
        print(f"Error in analyze: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/api/performance', methods=['GET'])
def get_performance():
    """Get system performance report"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        report = ai_system.get_performance_report()
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/classify', methods=['POST'])
def classify_image():
    """Classify waste from image"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads/analysis', filename)
        file.save(filepath)

        # Get classification
        classification = ai_system._step_classify_waste(filepath)
        
        return jsonify(classification), 200
    
    except Exception as e:
        print(f"Error in classify: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/price-predict', methods=['POST'])
def predict_price():
    """Predict price for waste"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        data = request.json
        waste_type = data.get('waste_type', 'rice')
        quantity = float(data.get('quantity', 1000))
        season = data.get('season', 'kharif')

        price_data = ai_system._step_predict_price(waste_type, quantity, season)
        
        return jsonify(price_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/quality-assess', methods=['POST'])
def assess_quality():
    """Assess quality parameters"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        data = request.json
        moisture = float(data.get('moisture', 10))
        calorific = float(data.get('calorific', 15))
        purity = float(data.get('purity', 98))
        carbon = float(data.get('carbon', 45))

        quality = ai_system._step_assess_quality(moisture, calorific, purity, carbon)
        quality['quality_score'] = ai_system._calculate_quality_score(quality)
        
        return jsonify(quality), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get buyer recommendations"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        data = request.json
        waste_type = data.get('waste_type', 'rice')
        quality_score = float(data.get('quality_score', 80))

        recommendations = ai_system._step_recommend_buyers(waste_type, quality_score)
        
        return jsonify(recommendations), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/carbon', methods=['POST'])
def calculate_carbon():
    """Calculate carbon impact"""
    if not AI_AVAILABLE:
        return jsonify({"error": "AI System not available"}), 503
    
    try:
        data = request.json
        waste_type = data.get('waste_type', 'rice')
        quantity = float(data.get('quantity', 1000))

        carbon_data = ai_system._step_calculate_carbon(waste_type, quantity)
        
        return jsonify(carbon_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================
# CHATBOT API ROUTES
# =====================

def allowed_file(filename):
    """Check if file is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/api/chat/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text"""
    if not CHATBOT_AVAILABLE:
        return jsonify({"error": "Chatbot not available"}), 503
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio provided"}), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Transcribe with Groq
        with open(filepath, 'rb') as f:
            response = groq_client.audio.transcriptions.create(
                model='whisper-large-v3-turbo',
                file=f,
            )
            transcribed_text = response.text

        # Clean up
        os.remove(filepath)
        
        return jsonify({"text": transcribed_text}), 200
    
    except Exception as e:
        print(f"Error in transcribe: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat/ask', methods=['POST'])
def ask_question():
    """Get chatbot response"""
    if not CHATBOT_AVAILABLE:
        return jsonify({"error": "Chatbot not available"}), 503
    
    try:
        data = request.json
        question = data.get('question', '')
        
        if not question:
            return jsonify({"error": "No question provided"}), 400

        # Get response from Groq
        response = groq_client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=[
                {"role": "system", "content": "You are a helpful agriculture expert chatbot for Indian farmers. Answer questions about farming, agricultural waste, prices, and sustainability."},
                {"role": "user", "content": question}
            ],
        )
        
        answer = response.choices[0].message.content
        
        return jsonify({"answer": answer}), 200
    
    except Exception as e:
        print(f"Error in ask: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    if not CHATBOT_AVAILABLE:
        return jsonify({"error": "Chatbot not available"}), 503
    
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Create audio file
        tts = gTTS(text, lang='en')
        filename = f"tts_{int(datetime.now().timestamp())}.mp3"
        audio_path = os.path.join('static/audio', filename)
        
        Path('static/audio').mkdir(parents=True, exist_ok=True)
        tts.save(audio_path)
        
        return jsonify({"audio_url": f"/static/audio/{filename}"}), 200
    
    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        return jsonify({"error": str(e)}), 500


# =====================
# UTILITY ROUTES
# =====================

def save_analysis_result(analysis, filename):
    """Save analysis result to file"""
    try:
        results_dir = Path('results')
        results_dir.mkdir(parents=True, exist_ok=True)
        
        result_filename = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        result_path = results_dir / result_filename
        
        with open(result_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"✓ Analysis saved: {result_path}")
    except Exception as e:
        print(f"⚠ Could not save analysis: {e}")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "ai_system": "available" if AI_AVAILABLE else "unavailable",
        "chatbot": "available" if CHATBOT_AVAILABLE else "unavailable"
    }), 200


@app.route('/api/status', methods=['GET'])
def system_status():
    """Get full system status"""
    status = {
        "timestamp": datetime.now().isoformat(),
        "components": {
            "frontend": "running",
            "ai_system": "available" if AI_AVAILABLE else "unavailable",
            "chatbot": "available" if CHATBOT_AVAILABLE else "unavailable",
            "database": "not configured"
        },
        "capabilities": []
    }
    
    if AI_AVAILABLE:
        status["capabilities"].extend([
            "waste_classification",
            "price_prediction",
            "quality_assessment",
            "buyer_recommendations",
            "carbon_impact_calculation"
        ])
    
    if CHATBOT_AVAILABLE:
        status["capabilities"].extend([
            "audio_transcription",
            "question_answering",
            "text_to_speech"
        ])
    
    return jsonify(status), 200


# =====================
# ERROR HANDLERS
# =====================

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


# =====================
# MAIN ENTRY POINT
# =====================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌾 AgriWaste to Worth - Unified Server")
    print("="*60)
    print(f"\n📡 Starting server...")
    print(f"🌐 Frontend: http://localhost:5000")
    print(f"📊 API: http://localhost:5000/api/")
    print(f"💬 Status: http://localhost:5000/api/status")
    print(f"\n✓ AI System: {'Enabled' if AI_AVAILABLE else 'Disabled'}")
    print(f"✓ Chatbot: {'Enabled' if CHATBOT_AVAILABLE else 'Disabled'}")
    print("\nPress Ctrl+C to stop the server.")
    print("="*60 + "\n")
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False
    )
