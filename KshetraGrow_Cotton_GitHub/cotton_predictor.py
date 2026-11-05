
import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    "original_five_stage": os.path.join(
        BASE_DIR, "models", "cotton",
        "original_five_stage", "cotton_mobilenetv2.keras"
    ),
    "in_situ_four_stage": os.path.join(
        BASE_DIR, "models", "cotton",
        "in_situ_four_stage", "cotton_field_mobilenetv2.keras"
    )
}

CLASS_PATHS = {
    "original_five_stage": os.path.join(
        BASE_DIR, "models", "cotton",
        "original_five_stage", "class_mapping.json"
    ),
    "in_situ_four_stage": os.path.join(
        BASE_DIR, "models", "cotton",
        "in_situ_four_stage", "class_mapping.json"
    )
}

_loaded_models = {}
_loaded_classes = {}

def load_model(model_id):
    """Load and cache the selected cotton model."""
    if model_id not in MODEL_PATHS:
        raise ValueError(
            f"Unknown model_id: {model_id}. "
            f"Choose from {list(MODEL_PATHS.keys())}"
        )

    if model_id not in _loaded_models:
        _loaded_models[model_id] = tf.keras.models.load_model(
            MODEL_PATHS[model_id],
            compile=False,
            safe_mode=True
        )

        with open(CLASS_PATHS[model_id], "r") as file:
            _loaded_classes[model_id] = json.load(file)

    return _loaded_models[model_id]


def predict_image(image_path, model_id):
    """
    Predict cotton growth stage from an RGB image.

    model_id:
      - original_five_stage
      - in_situ_four_stage
    """
    model = load_model(model_id)
    classes = _loaded_classes[model_id]

    image = Image.open(image_path).convert("RGB")
    image = image.resize((160, 160))

    image_array = np.asarray(image, dtype=np.float32) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    probabilities = model.predict(image_array, verbose=0)[0]

    predicted_index = int(np.argmax(probabilities))
    predicted_class = classes[str(predicted_index)]
    confidence = float(probabilities[predicted_index])

    return {
        "crop": "Cotton",
        "model_id": model_id,
        "predicted_stage": predicted_class,
        "confidence": confidence,
        "class_probabilities": {
            classes[str(i)]: float(probabilities[i])
            for i in range(len(probabilities))
        }
    }
