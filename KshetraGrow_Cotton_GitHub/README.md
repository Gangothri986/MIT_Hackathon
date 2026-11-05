# KshetraGrow AI — Cotton Growth Stage Models

This package contains two independently trained MobileNetV2 cotton growth-stage classifiers.

## Project structure

- `cotton_predictor.py` — shared prediction module
- `requirements.txt` — Python dependencies
- `models/cotton/original_five_stage/` — original five-stage model and metadata
- `models/cotton/in_situ_four_stage/` — in-situ four-stage model and metadata

## Model 1: Original five-stage

- Model ID: `original_five_stage`
- Architecture: MobileNetV2
- Input: RGB, 160 x 160
- Classes: Stage-1, Stage-2, Stage-3, Stage-4, Stage-5
- Training images: 959
- Validation images: 204
- Test images: 205
- Test accuracy: 60.49%
- Macro F1: 0.6328
- Dataset: Mendeley Cotton Dataset subset

The five labels are retained as provided by the dataset organization. Their exact botanical definitions have not been independently verified.

## Model 2: In-situ four-stage

- Model ID: `in_situ_four_stage`
- Architecture: MobileNetV2
- Input: RGB, 160 x 160
- Classes: Boll_Development, Boll_Opening, Flowering, Squaring
- Training images: 482
- Validation images: 114
- Test images: 119
- Test accuracy: 63.03%
- Macro F1: 0.6579
- Dataset: Zenodo in-situ cotton phenology photographs

Dataset: https://zenodo.org/records/7646864

The dataset split is parcel-wise. The available test subset contains 119 images because some intended test images were not recovered during dataset preparation.

## Installation

Install dependencies:

    pip install -r requirements.txt

## Prediction example

    from cotton_predictor import predict_image

    result = predict_image(
        image_path="cotton_sample.jpg",
        model_id="in_situ_four_stage"
    )

    print(result)

To use the original model, set model_id to `original_five_stage`.

The prediction result contains the crop, model ID, predicted stage, confidence and class probabilities.

## Input preprocessing

Both models receive RGB images resized to 160 x 160 and converted to float32 values in the range [0, 1].

The in-situ model includes an explicit Rescaling layer (scale=2, offset=-1).

The original five-stage model has no explicit preprocessing layer in its inspected saved architecture. Its input is passed as RGB values scaled to [0, 1], matching the recorded training input convention. Do not add another preprocessing operation without verifying it against the original training pipeline.

## Important limitations

- These are two independent classifiers, not a unified model.
- Their classes and datasets differ; predictions are not interchangeable.
- The reported metrics apply only to their respective held-out test sets.
- These results do not establish performance across all cotton varieties, locations, seasons, lighting conditions or phone cameras.
- The test accuracies are moderate baselines, not guarantees of field performance.
- The original five-stage labels have not been mapped to verified botanical stages.
- These models classify growth stages; they do not detect cotton diseases.
- Validate using representative local field images before agricultural use.

Softmax confidence is not a calibrated probability that a prediction is correct.

## Backend integration

Pass an explicit model ID to the prediction module. Supported IDs:

- `original_five_stage`
- `in_situ_four_stage`

Do not silently switch between models or combine their class probabilities.

## Dataset and licensing

Trained model files and metadata are included. Original datasets, temporary checkpoints and training notebooks are excluded.

Check the original dataset and pretrained-weight licenses before redistribution. This package does not replace the original dataset licenses.
