"""
Face Recognition Module for Attendance System
Uses face_recognition library for encoding and comparison
"""

import os
import cv2
import face_recognition
import numpy as np
from datetime import datetime

# Base directory for dataset
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

# Face recognition tolerance (lower = more strict, recommended: 0.4-0.6)
TOLERANCE = 0.5


class FaceRecognitionManager:
    """
    Manages face recognition operations including:
    - Loading known faces from dataset
    - Recognizing faces in camera frames
    - Tracking recognized students
    """
    
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []  # Format: "Name_RollNo"
        self.known_roll_numbers = []
        self.is_loaded = False
    
    def load_known_faces(self):
        """
        Load face encodings from the dataset folder.
        Expected structure: dataset/StudentName_RollNo/image.jpg
        """
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_roll_numbers = []
        
        if not os.path.exists(DATASET_PATH):
            os.makedirs(DATASET_PATH)
            print(f"Created dataset folder at: {DATASET_PATH}")
            return False
        
        # Iterate through student folders
        for student_folder in os.listdir(DATASET_PATH):
            folder_path = os.path.join(DATASET_PATH, student_folder)
            
            if not os.path.isdir(folder_path):
                continue
            
            # Parse folder name: Name_RollNo (e.g., Rahul_Kumar_CSE001)
            parts = student_folder.rsplit('_', 1)
            if len(parts) == 2:
                student_name = parts[0].replace('_', ' ')
                roll_no = parts[1]
            else:
                student_name = student_folder.replace('_', ' ')
                roll_no = student_folder
            
            # Find image files in the folder
            image_loaded = False
            for filename in os.listdir(folder_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    image_path = os.path.join(folder_path, filename)
                    
                    try:
                        # Load image and get face encoding
                        image = face_recognition.load_image_file(image_path)
                        face_encodings = face_recognition.face_encodings(image)
                        
                        if len(face_encodings) > 0:
                            # Use the first face found
                            self.known_face_encodings.append(face_encodings[0])
                            self.known_face_names.append(student_name)
                            self.known_roll_numbers.append(roll_no)
                            image_loaded = True
                            print(f"Loaded face: {student_name} ({roll_no})")
                            break  # Only need one image per student
                        else:
                            print(f"No face found in: {image_path}")
                    except Exception as e:
                        print(f"Error loading {image_path}: {e}")
            
            if not image_loaded:
                print(f"Warning: No valid face image for {student_folder}")
        
        self.is_loaded = len(self.known_face_encodings) > 0
        print(f"Loaded {len(self.known_face_encodings)} known faces")
        return self.is_loaded
    
    def recognize_faces(self, frame):
        """
        Recognize faces in a video frame.
        
        Args:
            frame: BGR image from OpenCV (numpy array)
        
        Returns:
            List of dicts with recognized face info:
            [{'name': str, 'roll_no': str, 'location': tuple, 'confidence': float}]
        """
        if not self.is_loaded:
            return []
        
        recognized = []
        
        # Convert BGR to RGB (face_recognition uses RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Resize for faster processing (optional, comment out for better accuracy)
        small_frame = cv2.resize(rgb_frame, (0, 0), fx=0.25, fy=0.25)
        
        # Find faces in the frame
        face_locations = face_recognition.face_locations(small_frame)
        face_encodings = face_recognition.face_encodings(small_frame, face_locations)
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Compare with known faces
            matches = face_recognition.compare_faces(
                self.known_face_encodings, 
                face_encoding, 
                tolerance=TOLERANCE
            )
            
            # Calculate face distances for confidence
            face_distances = face_recognition.face_distance(
                self.known_face_encodings, 
                face_encoding
            )
            
            if len(face_distances) > 0 and True in matches:
                # Get the best match
                best_match_index = np.argmin(face_distances)
                
                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
                    roll_no = self.known_roll_numbers[best_match_index]
                    
                    # Calculate confidence (inverse of distance, scaled to percentage)
                    distance = face_distances[best_match_index]
                    confidence = round((1 - distance) * 100, 1)
                    
                    # Scale location back (since we resized)
                    location = (top * 4, right * 4, bottom * 4, left * 4)
                    
                    recognized.append({
                        'name': name,
                        'roll_no': roll_no,
                        'location': location,
                        'confidence': confidence
                    })
        
        return recognized
    
    def get_loaded_students(self):
        """Return list of loaded student info."""
        return [
            {'name': name, 'roll_no': roll}
            for name, roll in zip(self.known_face_names, self.known_roll_numbers)
        ]


class WebcamCapture:
    """
    Manages webcam capture for face recognition.
    """
    
    def __init__(self, camera_index=0):
        self.camera_index = camera_index
        self.cap = None
        self.is_running = False
    
    def start(self):
        """Start the webcam capture."""
        if self.cap is None or not self.cap.isOpened():
            self.cap = cv2.VideoCapture(self.camera_index)
            
            # Set camera properties for better performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.is_running = self.cap.isOpened()
        return self.is_running
    
    def read_frame(self):
        """Read a frame from the webcam."""
        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret:
                return frame
        return None
    
    def stop(self):
        """Stop the webcam capture."""
        self.is_running = False
        if self.cap:
            self.cap.release()
            self.cap = None
    
    def __del__(self):
        """Cleanup on destruction."""
        self.stop()


def draw_face_boxes(frame, recognized_faces):
    """
    Draw bounding boxes and labels on frame for recognized faces.
    
    Args:
        frame: OpenCV image (BGR)
        recognized_faces: List from recognize_faces()
    
    Returns:
        Frame with annotations
    """
    for face in recognized_faces:
        top, right, bottom, left = face['location']
        name = face['name']
        confidence = face['confidence']
        
        # Draw rectangle
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        
        # Draw label background
        label = f"{name} ({confidence}%)"
        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
        cv2.rectangle(
            frame, 
            (left, bottom), 
            (left + label_size[0] + 10, bottom + label_size[1] + 10),
            (0, 255, 0), 
            cv2.FILLED
        )
        
        # Draw text
        cv2.putText(
            frame, 
            label, 
            (left + 5, bottom + label_size[1] + 5),
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.5, 
            (0, 0, 0), 
            1
        )
    
    return frame


# Global instance for use across the application
face_manager = FaceRecognitionManager()


# Testing function
if __name__ == '__main__':
    print("Testing Face Recognition Module...")
    
    # Load known faces
    if face_manager.load_known_faces():
        print(f"\nLoaded students: {face_manager.get_loaded_students()}")
        
        # Test with webcam
        cam = WebcamCapture()
        if cam.start():
            print("\nWebcam started. Press 'q' to quit.")
            
            while cam.is_running:
                frame = cam.read_frame()
                if frame is None:
                    continue
                
                # Recognize faces
                recognized = face_manager.recognize_faces(frame)
                
                # Draw boxes
                frame = draw_face_boxes(frame, recognized)
                
                # Display
                cv2.imshow('Face Recognition Test', frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            cam.stop()
            cv2.destroyAllWindows()
        else:
            print("Failed to start webcam")
    else:
        print("No known faces loaded. Add images to the dataset folder.")
