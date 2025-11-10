from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle, io
import numpy as np
from PIL import Image
import cv2

# ---------- Config ----------
MODEL_PATH = "models/skin_tone_model.pkl"

app = Flask(__name__)
# Allow local dev origins (Vite 5173, your app on 8080, etc.)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "*"  # ok for local development
            ]
        }
    },
)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB uploads

# ---------- Load model pack ----------
with open(MODEL_PATH, "rb") as f:
    loaded = pickle.load(f)

rf = None        # classifier
scaler = None    # optional StandardScaler
le = None        # optional LabelEncoder

if isinstance(loaded, dict):
    rf = loaded.get("rf") or loaded.get("model")
    scaler = loaded.get("scaler")
    le = loaded.get("label_encoder")
else:
    # assume it's a fitted classifier object (e.g., RandomForestClassifier)
    rf = loaded

if rf is None:
    raise RuntimeError(
        "Model not found in pickle. Expected dict {'rf','scaler','label_encoder'} "
        "or a fitted classifier object."
    )

# ---------- Health ----------
@app.get("/health")
def health():
    return {"ok": True}

# ---------- Feature builder (adaptive) ----------
def make_features(pil_img: Image.Image, expected_dims: int) -> np.ndarray:
    """
    Build features to match the model/scaler input size.

    If 3 → [Y_mean, Cr_mean, Cb_mean]
    If 6 → [Y_mean, Cr_mean, Cb_mean, Y_std, Cr_std, Cb_std]
    Otherwise → build 6 and truncate/pad to expected_dims.
    """
    rgb = np.array(pil_img.convert("RGB"))
    ycrcb = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
    flat = ycrcb.reshape(-1, 3)

    means = flat.mean(axis=0).astype(np.float32)  # (3,)
    stds  = flat.std(axis=0).astype(np.float32)   # (3,)

    if expected_dims == 3:
        feats = means
    elif expected_dims == 6:
        feats = np.concatenate([means, stds])
    else:
        base = np.concatenate([means, stds])  # 6 long
        if expected_dims < 6:
            feats = base[:expected_dims]
        else:
            pad = np.zeros(expected_dims - 6, dtype=np.float32)
            feats = np.concatenate([base, pad])

    return feats

# ---------- Predict ----------
@app.post("/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"error": "file field missing"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "empty filename"}), 400

    try:
        pil = Image.open(io.BytesIO(file.read())).convert("RGB")

        # Determine the feature size expected by model/scaler
        expected = getattr(rf, "n_features_in_", None)
        if expected is None and scaler is not None:
            expected = getattr(scaler, "n_features_in_", None)
        if expected is None:
            expected = 3  # default to 3 if unknown (your model error indicated 3)

        feats = make_features(pil, expected).reshape(1, -1)

        # If scaler exists, slice to its expected size and transform
        if scaler is not None:
            scaler_dims = getattr(scaler, "n_features_in_", feats.shape[1])
            feats = feats[:, :scaler_dims]
            feats = scaler.transform(feats)

        # Ensure input matches model expected size
        model_dims = getattr(rf, "n_features_in_", feats.shape[1])
        feats = feats[:, :model_dims]

        # Predict
        probs_dict = {}
        classes = getattr(rf, "classes_", None)

        if hasattr(rf, "predict_proba"):
            probs = rf.predict_proba(feats)[0]
        else:
            probs = None

        pred_raw = rf.predict(feats)[0]

        # Decode label via label encoder if present
        tone = pred_raw
        if le is not None:
            try:
                tone = le.inverse_transform([pred_raw])[0]
            except Exception:
                tone = str(pred_raw)

        # Map probabilities to label names
        if probs is not None and classes is not None:
            labels = classes
            try:
                if le is not None:
                    labels = le.inverse_transform(classes)
            except Exception:
                pass
            for lab, p in zip(labels, probs):
                probs_dict[str(lab)] = float(p)

        return jsonify({"tone": str(tone), "probs": probs_dict})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("✅ Model loaded. Starting server...")
    app.run(host="0.0.0.0", port=5000, debug=True)
