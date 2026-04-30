#!/usr/bin/env python
"""
Model Evaluation and Accuracy Measurement for Agriculture Waste Marketplace
Measures accuracy for:
- AI Waste Classification (CNN) - Accuracy, Precision, Recall, F1-Score
- Price Prediction - MAE, RMSE, MAPE, R²
- Quality Assessment - Validation metrics
- Buyer Recommendations - Recommendation accuracy
- Carbon Impact - Calculate and validate
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    mean_absolute_percentage_error,
)
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras

from plant_waste_pipeline import (
    load_or_train,
    predict_class,
    load_labels,
    DEFAULT_MODEL_PATH,
    DEFAULT_LABELS_PATH,
    DEFAULT_DATA_DIR,
)


class ModelEvaluator:
    """Comprehensive model evaluation and accuracy measurement"""

    def __init__(self, model_path: Path = DEFAULT_MODEL_PATH, labels_path: Path = DEFAULT_LABELS_PATH):
        self.model = keras.models.load_model(model_path)
        self.labels = load_labels(labels_path)
        self.results = {}

    # ======================
    # 1. CLASSIFICATION METRICS
    # ======================

    def evaluate_classification(
        self,
        test_images_dir: Path,
        img_size: Tuple[int, int] = (224, 224),
    ) -> Dict:
        """
        Evaluate CNN classification model on test set
        Returns: accuracy, precision, recall, F1-score, confusion matrix
        """
        from tensorflow.keras.preprocessing import image_dataset_from_directory

        test_ds = image_dataset_from_directory(
            test_images_dir,
            image_size=img_size,
            batch_size=32,
            label_mode="int",
            shuffle=False,
        )

        y_true, y_pred = [], []

        for images, labels in test_ds:
            preds = self.model.predict(images, verbose=0)
            y_true.extend(labels.numpy())
            y_pred.extend(np.argmax(preds, axis=1))

        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        # Calculate metrics
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
        recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
        conf_matrix = confusion_matrix(y_true, y_pred)

        # Per-class metrics
        class_report = classification_report(
            y_true, y_pred, target_names=self.labels, output_dict=True, zero_division=0
        )

        results = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "confusion_matrix": conf_matrix.tolist(),
            "per_class_metrics": class_report,
        }

        self.results["classification"] = results
        return results

    def get_prediction_confidence(self, image_path: Path) -> Dict:
        """Get confidence scores for all classes"""
        from plant_waste_pipeline import preprocess_image

        arr = preprocess_image(image_path)
        preds = self.model.predict(arr, verbose=0)[0]
        
        confidence_dict = {
            self.labels[i]: float(preds[i]) for i in range(len(self.labels))
        }
        
        # Sort by confidence
        sorted_confidence = dict(sorted(confidence_dict.items(), key=lambda x: x[1], reverse=True))
        
        return sorted_confidence

    # ======================
    # 2. PRICE PREDICTION METRICS
    # ======================

    def evaluate_price_prediction(self, actual_prices: np.ndarray, predicted_prices: np.ndarray) -> Dict:
        """
        Evaluate price prediction model
        Returns: MAE, RMSE, MAPE, R²
        """
        actual_prices = np.array(actual_prices)
        predicted_prices = np.array(predicted_prices)

        mae = mean_absolute_error(actual_prices, predicted_prices)
        rmse = np.sqrt(mean_squared_error(actual_prices, predicted_prices))
        mape = mean_absolute_percentage_error(actual_prices, predicted_prices)
        r2 = r2_score(actual_prices, predicted_prices)

        # Additional metrics
        mape_percentage = mape * 100
        mean_actual = np.mean(actual_prices)
        prediction_error_percentage = (mae / mean_actual) * 100

        results = {
            "mae": float(mae),  # Mean Absolute Error
            "rmse": float(rmse),  # Root Mean Squared Error
            "mape": float(mape_percentage),  # Mean Absolute Percentage Error (%)
            "r2_score": float(r2),  # R² Score (0-1, higher is better)
            "mean_actual_price": float(mean_actual),
            "prediction_error_percentage": float(prediction_error_percentage),
            "sample_size": len(actual_prices),
        }

        self.results["price_prediction"] = results
        return results

    def predict_price(
        self,
        waste_type: str,
        quantity_kg: float,
        moisture_percent: float,
        historical_prices: List[float],
    ) -> Dict:
        """
        Simulate price prediction for a waste type
        Factors: historical average, quantity, moisture, market trends
        """
        base_price = np.mean(historical_prices) if historical_prices else 5000

        # Moisture adjustment
        optimal_moisture = 12  # percent
        moisture_adjustment = 1 - abs(moisture_percent - optimal_moisture) * 0.02

        # Quantity bulk discount
        quantity_factor = 1 - (quantity_kg / 10000) * 0.1

        predicted_price = base_price * moisture_adjustment * quantity_factor
        
        # Add confidence based on data availability
        confidence = min(0.95, 0.5 + len(historical_prices) * 0.05)

        return {
            "waste_type": waste_type,
            "predicted_price_per_kg": float(predicted_price),
            "base_price": float(base_price),
            "adjustments": {
                "moisture": float(moisture_adjustment),
                "quantity": float(quantity_factor),
            },
            "confidence": float(confidence),
            "quantity_kg": quantity_kg,
        }

    # ======================
    # 3. QUALITY ASSESSMENT
    # ======================

    def evaluate_quality_assessment(
        self, predicted_qualities: List[Dict], actual_qualities: List[Dict]
    ) -> Dict:
        """
        Evaluate quality assessment accuracy
        """
        moisture_errors = []
        calorific_errors = []
        purity_errors = []

        for pred, actual in zip(predicted_qualities, actual_qualities):
            if "moisture" in pred and "moisture" in actual:
                moisture_errors.append(abs(pred["moisture"] - actual["moisture"]))
            if "calorific_value" in pred and "calorific_value" in actual:
                calorific_errors.append(abs(pred["calorific_value"] - actual["calorific_value"]))
            if "purity" in pred and "purity" in actual:
                purity_errors.append(abs(pred["purity"] - actual["purity"]))

        results = {
            "moisture_mae": float(np.mean(moisture_errors)) if moisture_errors else None,
            "calorific_mae": float(np.mean(calorific_errors)) if calorific_errors else None,
            "purity_mae": float(np.mean(purity_errors)) if purity_errors else None,
            "samples_evaluated": len(predicted_qualities),
        }

        self.results["quality_assessment"] = results
        return results

    def assess_waste_quality(self, waste_type: str) -> Dict:
        """
        Assess quality parameters for a waste type
        """
        quality_params = {
            "rice_husk": {
                "moisture": (10, 12),
                "calorific_value": (14, 16),
                "purity": (92, 98),
                "carbon_content": (35, 45),
            },
            "wheat_straw": {
                "moisture": (12, 15),
                "calorific_value": (15, 17),
                "purity": (85, 95),
                "carbon_content": (40, 50),
            },
            "cotton_stalks": {
                "moisture": (10, 13),
                "calorific_value": (16, 18),
                "purity": (80, 90),
                "carbon_content": (42, 52),
            },
            "groundnut_shells": {
                "moisture": (8, 10),
                "calorific_value": (18, 20),
                "purity": (90, 97),
                "carbon_content": (45, 55),
            },
        }

        params = quality_params.get(waste_type.lower().replace(" ", "_"), {})
        
        if not params:
            params = quality_params["rice_husk"]  # Default

        quality = {
            "waste_type": waste_type,
            "moisture_percent": float(np.random.uniform(*params["moisture"])),
            "calorific_value_mj_kg": float(np.random.uniform(*params["calorific_value"])),
            "purity_percent": float(np.random.uniform(*params["purity"])),
            "carbon_content_percent": float(np.random.uniform(*params["carbon_content"])),
            "quality_grade": "A" if np.random.random() > 0.3 else "B",
        }

        return quality

    # ======================
    # 4. BUYER RECOMMENDATIONS
    # ======================

    def evaluate_buyer_recommendations(
        self, predicted_buyers: List[Tuple[str, float]], actual_buyers: List[str]
    ) -> Dict:
        """
        Evaluate recommendation accuracy
        predicted_buyers: List of (buyer_id, score) tuples
        actual_buyers: List of actual buyers who matched
        """
        predicted_ids = [b[0] for b in predicted_buyers]
        
        # Calculate hit rate (was a recommended buyer in top-k?)
        hits = sum(1 for buyer in actual_buyers if buyer in predicted_ids[:5])
        
        results = {
            "top_5_hit_rate": float(hits / len(actual_buyers)) if actual_buyers else 0.0,
            "recommendation_count": len(predicted_buyers),
            "accuracy": float(hits / min(5, len(actual_buyers))) if actual_buyers else 0.0,
        }

        self.results["buyer_recommendations"] = results
        return results

    def recommend_buyers(self, waste_type: str, price_range: Tuple[float, float]) -> List[Dict]:
        """
        Recommend suitable buyers for given waste type and price
        """
        buyers_db = [
            {"id": "B001", "name": "Green Energy Ltd", "type": "Biomass Power Plant", 
             "interests": ["rice_husk", "wheat_straw"], "min_price": 4500, "max_price": 6500, "rating": 4.7},
            {"id": "B002", "name": "BioFuel Solutions", "type": "Biofuel Producer", 
             "interests": ["cotton_stalks", "groundnut_shells"], "min_price": 5000, "max_price": 7000, "rating": 4.5},
            {"id": "B003", "name": "Agri-Process Inc", "type": "Bio-composite Manufacturer", 
             "interests": ["rice_straw", "wheat_straw"], "min_price": 3500, "max_price": 5500, "rating": 4.3},
            {"id": "B004", "name": "Carbon Credits Corp", "type": "Carbon Trading", 
             "interests": ["all"], "min_price": 0, "max_price": 100000, "rating": 4.9},
        ]

        recommendations = []
        avg_price = (price_range[0] + price_range[1]) / 2

        for buyer in buyers_db:
            interest_match = waste_type.lower() in [i.lower() for i in buyer["interests"]] or "all" in buyer["interests"]
            price_match = buyer["min_price"] <= avg_price <= buyer["max_price"]
            
            if interest_match and price_match:
                match_score = buyer["rating"] / 5.0
                recommendations.append({
                    "buyer_id": buyer["id"],
                    "name": buyer["name"],
                    "type": buyer["type"],
                    "match_score": float(match_score),
                    "rating": buyer["rating"],
                })

        # Sort by score
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        return recommendations

    # ======================
    # 5. CARBON IMPACT CALCULATION
    # ======================

    def calculate_carbon_impact(
        self, waste_type: str, quantity_kg: float, processing_type: str = "energy"
    ) -> Dict:
        """
        Calculate carbon impact and verify accuracy
        Carbon offset: kg CO2e avoided per kg waste processed
        """
        carbon_factors = {
            "rice_husk": {"energy": 2.5, "compost": 1.8, "biochar": 3.2},
            "wheat_straw": {"energy": 2.3, "compost": 1.6, "biochar": 3.0},
            "cotton_stalks": {"energy": 2.7, "compost": 2.0, "biochar": 3.4},
            "groundnut_shells": {"energy": 2.4, "compost": 1.9, "biochar": 3.1},
        }

        factor = carbon_factors.get(waste_type.lower().replace(" ", "_"), {}).get(processing_type, 2.5)
        
        co2_avoided_kg = quantity_kg * factor
        
        # Tree equivalent: 1 tree absorbs ~21 kg CO2/year
        trees_equivalent = co2_avoided_kg / 21
        
        # Energy equivalent: 1 kWh ~0.4 kg CO2
        energy_equivalent_kwh = co2_avoided_kg / 0.4

        results = {
            "waste_type": waste_type,
            "quantity_kg": quantity_kg,
            "processing_type": processing_type,
            "co2_avoided_kg": float(co2_avoided_kg),
            "trees_equivalent": float(trees_equivalent),
            "energy_equivalent_kwh": float(energy_equivalent_kwh),
            "carbon_factor_used": float(factor),
            "impact_category": "High" if co2_avoided_kg > 1000 else "Medium" if co2_avoided_kg > 500 else "Low",
        }

        return results

    def evaluate_carbon_impact(
        self, predicted_impacts: List[float], actual_impacts: List[float]
    ) -> Dict:
        """Evaluate accuracy of carbon impact predictions"""
        mae = mean_absolute_error(actual_impacts, predicted_impacts)
        mape = mean_absolute_percentage_error(actual_impacts, predicted_impacts)
        r2 = r2_score(actual_impacts, predicted_impacts)

        results = {
            "mae_kg_co2": float(mae),
            "mape_percent": float(mape * 100),
            "r2_score": float(r2),
            "samples": len(predicted_impacts),
        }

        self.results["carbon_impact"] = results
        return results

    # ======================
    # COMPREHENSIVE EVALUATION
    # ======================

    def generate_evaluation_report(self) -> Dict:
        """Generate complete evaluation report"""
        report = {
            "timestamp": pd.Timestamp.now().isoformat(),
            "model_info": {
                "labels": self.labels,
                "num_classes": len(self.labels),
            },
            "metrics": self.results,
        }

        return report

    def save_report(self, output_path: Path) -> None:
        """Save evaluation report to JSON"""
        report = self.generate_evaluation_report()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2)

    def print_summary(self) -> None:
        """Print evaluation summary"""
        print("\n" + "="*60)
        print("MODEL EVALUATION SUMMARY")
        print("="*60)

        if "classification" in self.results:
            clf = self.results["classification"]
            print("\n📊 CLASSIFICATION METRICS:")
            print(f"  Accuracy:  {clf['accuracy']:.4f} (goal: >0.85)")
            print(f"  Precision: {clf['precision']:.4f}")
            print(f"  Recall:    {clf['recall']:.4f}")
            print(f"  F1-Score:  {clf['f1_score']:.4f}")

        if "price_prediction" in self.results:
            price = self.results["price_prediction"]
            print("\n💰 PRICE PREDICTION METRICS:")
            print(f"  MAE:    ₹{price['mae']:.2f}")
            print(f"  RMSE:   ₹{price['rmse']:.2f}")
            print(f"  MAPE:   {price['mape']:.2f}% (goal: <10%)")
            print(f"  R²:     {price['r2_score']:.4f} (goal: >0.8)")

        if "quality_assessment" in self.results:
            quality = self.results["quality_assessment"]
            print("\n✅ QUALITY ASSESSMENT:")
            if quality["moisture_mae"]:
                print(f"  Moisture MAE:      {quality['moisture_mae']:.2f}%")
            if quality["calorific_mae"]:
                print(f"  Calorific MAE:     {quality['calorific_mae']:.2f} MJ/kg")
            if quality["purity_mae"]:
                print(f"  Purity MAE:        {quality['purity_mae']:.2f}%")

        if "buyer_recommendations" in self.results:
            buyers = self.results["buyer_recommendations"]
            print("\n🎯 BUYER RECOMMENDATIONS:")
            print(f"  Top-5 Hit Rate:    {buyers['top_5_hit_rate']:.2%}")
            print(f"  Accuracy:          {buyers['accuracy']:.2%}")

        print("\n" + "="*60 + "\n")


# ======================
# DEMO / TEST FUNCTIONS
# ======================

def test_evaluation():
    """Test the evaluation module with sample data"""
    evaluator = ModelEvaluator()

    # Test price prediction
    actual_prices = np.array([5200, 5400, 5100, 5600, 5300])
    predicted_prices = np.array([5250, 5350, 5150, 5550, 5280])
    price_results = evaluator.evaluate_price_prediction(actual_prices, predicted_prices)
    print("\nPrice Prediction Evaluation:")
    print(json.dumps(price_results, indent=2))

    # Test quality assessment
    predicted_quality = [
        {"moisture": 11.5, "calorific_value": 15.2, "purity": 94.5},
        {"moisture": 12.1, "calorific_value": 15.8, "purity": 93.2},
    ]
    actual_quality = [
        {"moisture": 11.0, "calorific_value": 15.5, "purity": 95.0},
        {"moisture": 12.5, "calorific_value": 15.5, "purity": 92.8},
    ]
    quality_results = evaluator.evaluate_quality_assessment(predicted_quality, actual_quality)
    print("\nQuality Assessment Evaluation:")
    print(json.dumps(quality_results, indent=2))

    # Test price prediction
    price_pred = evaluator.predict_price("rice_husk", 1000, 11, [5200, 5300, 5250])
    print("\nPrice Prediction Sample:")
    print(json.dumps(price_pred, indent=2))

    # Test waste quality assessment
    quality = evaluator.assess_waste_quality("rice_husk")
    print("\nQuality Assessment Sample:")
    print(json.dumps(quality, indent=2))

    # Test buyer recommendations
    recommendations = evaluator.recommend_buyers("rice_husk", (5000, 5500))
    print("\nBuyer Recommendations:")
    print(json.dumps(recommendations, indent=2))

    # Test carbon impact
    carbon = evaluator.calculate_carbon_impact("rice_husk", 5000, "energy")
    print("\nCarbon Impact Calculation:")
    print(json.dumps(carbon, indent=2))

    evaluator.print_summary()


if __name__ == "__main__":
    test_evaluation()
