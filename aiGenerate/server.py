from flask import Flask, request, jsonify, send_from_directory, url_for
import torch
from PIL import Image
import os
import uuid
"""
    Flask: Used to create the web server.
    Torch: Loads the pre-trained AnimeGAN2 model.
    PIL (Pillow): Used for image processing.
    io: Handles in-memory image processing.
    os: Manages file paths and directories.
    uuid: Generates unique filenames for uploaded images.
"""

# Initialize Flask application
app = Flask(__name__)

# Define folder to store the image
UPLOAD_FOLDER = "static/avatars"

# Ensure the folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the AnimeGAN2 model for image Transformation
# Use GPU if available, else CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
model = torch.hub.load("bryandlee/animegan2-pytorch:main",
                       "generator", device=device).eval()
face2paint = torch.hub.load(
    "bryandlee/animegan2-pytorch:main", "face2paint", device=device)


@app.route("/generate", methods=["POST"])
def generate_avatar():
    """
    Handle POST request to generate an anime-style avatar.
    Expects an image file in the 'image' field of the request.
    Returns URLs for the original and generated images.
    """

# Return error if no file is uploaded
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    # Get the uploaded image
    image_file = request.files["image"]
    # Convert image to RGP format
    image = Image.open(image_file).convert("RGB")

    # Process image with AnimeGAN2
    output_image = face2paint(model, image, side_by_side=False)

    # Generate unique filenames using UUID to prevent filename conflicts
    original_filename = f"original_{uuid.uuid4().hex}.png"
    generated_filename = f"generated_{uuid.uuid4().hex}.png"

    # Define full paths for saving images
    original_filepath = os.path.join(UPLOAD_FOLDER, original_filename)
    generated_filepath = os.path.join(UPLOAD_FOLDER, generated_filename)

    # Save the original image and the generated anime-style image
    image.save(original_filepath, format="PNG")
    output_image.save(generated_filepath, format="PNG")

    # Generate URLs to access the saved images
    original_url = url_for(
        "get_avatar", filename=original_filename, _external=True)
    generated_url = url_for(
        "get_avatar", filename=generated_filename, _external=True)

    # Return response containing image URLs
    return jsonify({
        "message": "Avatar generated successfully!",
        "original_url": original_url,
        "generated_url": generated_url
    })


# Route to serve the images
@app.route("/avatars/<filename>")
def get_avatar(filename):
    """
    Serve saved images from the 'static/avatars' directory.
    Allows users to access stored images via URLs.
    """
    return send_from_directory(UPLOAD_FOLDER, filename)


# Start the Flask server on port 5000
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
