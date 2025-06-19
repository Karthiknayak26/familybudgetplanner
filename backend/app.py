from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)  # Allow requests from React

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        monthly_expenses = data.get('monthlyExpenses', [])

        if len(monthly_expenses) < 2:
            return jsonify({"error": "Need at least 2 months of data."}), 400

        # Convert to numpy arrays
        X = np.array(range(1, len(monthly_expenses)+1)).reshape(-1, 1)  # months: 1,2,3...
        y = np.array(monthly_expenses)  # totals

        model = LinearRegression()
        model.fit(X, y)

        next_month = np.array([[len(monthly_expenses)+1]])
        predicted = model.predict(next_month)

        return jsonify({
            "predictedExpense": round(float(predicted[0]), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
