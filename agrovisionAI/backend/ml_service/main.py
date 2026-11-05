
# import json
# from pathlib import Path
# from io import BytesIO

# import numpy as np
# import tensorflow as tf

# from PIL import Image, UnidentifiedImageError
# from fastapi import FastAPI, UploadFile, File, HTTPException
# from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# BASE_DIR = Path(__file__).resolve().parent
# MODEL_DIR = BASE_DIR / "models"

# MODEL_PATH = MODEL_DIR / "sweetpotato_rgb_model.keras"
# CLASS_PATH = MODEL_DIR / "class_mapping.json"

# app = FastAPI(title="AgroVision AI - Growth Stage Prediction")

# # Load model and class labels once
# with open(CLASS_PATH, "r") as f:
#     CLASS_MAPPING = json.load(f)

# model = tf.keras.models.load_model(
#     MODEL_PATH,
#     compile=False,
#     safe_mode=True
# )


# @app.get("/health")
# def health():
#     return {
#         "status": "online",
#         "model": "Sweet Potato RGB MobileNetV2"
#     }


# @app.post("/predict")
# async def predict_growth_stage(image: UploadFile = File(...)):

#     if not image.content_type or not image.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Upload a valid image.")

#     image_bytes = await image.read()

#     if len(image_bytes) > 10 * 1024 * 1024:
#         raise HTTPException(status_code=413, detail="Image exceeds 10 MB.")

#     try:
#         img = Image.open(BytesIO(image_bytes)).convert("RGB")
#         img = img.resize((160, 160))

#     except (UnidentifiedImageError, OSError):
#         raise HTTPException(status_code=400, detail="Invalid image.")

#     # Apply the same MobileNetV2 preprocessing
#     # used by the model's training pipeline.
#     img_array = np.asarray(img, dtype=np.float32)
#     img_array = preprocess_input(img_array)
#     img_array = np.expand_dims(img_array, axis=0)

#     predictions = model.predict(img_array, verbose=0)[0]

#     predicted_index = int(np.argmax(predictions))
#     predicted_stage = CLASS_MAPPING[str(predicted_index)]

#     probabilities = {
#         CLASS_MAPPING[str(i)]: round(float(p) * 100, 2)
#         for i, p in enumerate(predictions)
#     }

#     return {
#         "success": True,
#         "crop": "Sweet Potato",
#         "task": "Growth Stage Classification",
#         "predictedStage": predicted_stage,
#         "confidence": round(float(predictions[predicted_index]) * 100, 2),
#         "classProbabilities": probabilities
#     }
import json
from pathlib import Path
from io import BytesIO

import numpy as np
import tensorflow as tf

from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, UploadFile, File, HTTPException
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "sweetpotato_rgb_model.keras"
CLASS_PATH = MODEL_DIR / "class_mapping.json"

app = FastAPI(title="AgroVision AI - Growth Stage Prediction")

# Load class mapping
with open(CLASS_PATH, "r") as f:
    CLASS_MAPPING = json.load(f)

# Load trained model
model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

@app.get("/health")
def health():
    return {
        "status": "online",
        "model": "Sweet Potato RGB MobileNetV2"
    }


@app.post("/predict")
async def predict_growth_stage(image: UploadFile = File(...)):

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload a valid image.")

    image_bytes = await image.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB.")

    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = img.resize((160, 160))

    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Invalid image.")

    img_array = np.asarray(img, dtype=np.float32)

    # MobileNetV2 preprocessing
    img_array = preprocess_input(img_array)

    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))

    predicted_stage = CLASS_MAPPING[str(predicted_index)]

    probabilities = {
        CLASS_MAPPING[str(i)]: round(float(p) * 100, 2)
        for i, p in enumerate(predictions)
    }

    return {
        "success": True,
        "crop": "Sweet Potato",
        "task": "Growth Stage Classification",
        "predictedStage": predicted_stage,
        "confidence": round(float(predictions[predicted_index]) * 100, 2),
        "classProbabilities": probabilities
    }