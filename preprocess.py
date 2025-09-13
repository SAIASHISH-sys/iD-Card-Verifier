import cv2
import numpy as np
import os
from pdf2image import convert_from_path
from fpdf import FPDF
from PIL import Image

def correct_rotation(image):
    """Deskew image using Hough line transform."""
    gray = cv2.bitwise_not(image)
    thresh = cv2.threshold(gray, 0, 255,
                           cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                             flags=cv2.INTER_CUBIC,
                             borderMode=cv2.BORDER_REPLICATE)
    return rotated

def preprocess_image(cv_img):
    """Apply preprocessing pipeline to a single image."""
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)

    gaussian = cv2.GaussianBlur(denoised, (9, 9), 10.0)
    sharpened = cv2.addWeighted(denoised, 1.5, gaussian, -0.5, 0)

    thresh = cv2.adaptiveThreshold(sharpened, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 31, 2)

    deskewed = correct_rotation(thresh)
    final = cv2.resize(deskewed, (800, 600))
    return final

def save_images_as_pdf(images, output_pdf):
    """Save a list of OpenCV images into a single PDF."""
    pil_images = [Image.fromarray(img) if isinstance(img, np.ndarray) else img for img in images]
    
    # Convert grayscale to RGB for PDF compatibility
    pil_images_rgb = [im.convert("RGB") for im in pil_images]

    # Save first page, append others
    pil_images_rgb[0].save(output_pdf, save_all=True, append_images=pil_images_rgb[1:])
    print(f"[INFO] Preprocessed PDF saved at: {output_pdf}")

def preprocess_file(input_path):
    dir_name, file_name = os.path.split(input_path)
    name, _ = os.path.splitext(file_name)
    output_pdf = os.path.join(dir_name, f"{name}_preprocessed.pdf")

    preprocessed_pages = []

    if input_path.lower().endswith(('.jpg', '.jpeg', '.png')):
        # Single image case
        cv_img = cv2.imread(input_path)
        processed = preprocess_image(cv_img)
        preprocessed_pages.append(processed)

    elif input_path.lower().endswith('.pdf'):
        # PDF case: convert to images first
        pages = convert_from_path(input_path, dpi=300)
        for page in pages:
            cv_img = cv2.cvtColor(np.array(page), cv2.COLOR_RGB2BGR)
            processed = preprocess_image(cv_img)
            preprocessed_pages.append(processed)

    else:
        raise ValueError("Unsupported file format. Use JPG, JPEG, PNG, or PDF.")

    # Save all processed pages to single PDF
    save_images_as_pdf(preprocessed_pages, output_pdf)
    return output_pdf


# Example usage:
preprocess_file("Screenshot from 2025-09-13 21-17-20.pdf")
# preprocess_file("pancard_sample.pdf")
