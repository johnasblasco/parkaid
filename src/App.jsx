import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App = () => {
      const [imageSrc, setImageSrc] = useState(null);
      const [recognizedText, setRecognizedText] = useState('');
      const webcamRef = useRef(null);

      // Capture image from webcam
      const capture = React.useCallback(() => {
            const imageSrc = webcamRef.current.getScreenshot();
            setImageSrc(imageSrc);
      }, [webcamRef]);

      // Send captured image to OCR API
      const recognizeText = async (imageBase64) => {
            const apiKey = 'K82741021788957'; // Ensure this is valid
            const formData = new FormData();
            formData.append('base64Image', `data:image/jpeg;base64,${imageBase64}`);
            formData.append('apikey', apiKey);
            formData.append('OCREngine', '2');

            try {
                  const response = await axios.post(
                        'https://api.ocr.space/parse/image',
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                  );
                  console.log('API Response:', response.data);
                  if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
                        setRecognizedText(response.data.ParsedResults[0].ParsedText);
                  } else {
                        setRecognizedText('No plate detected.');
                  }
            } catch (error) {
                  console.error('OCR Error:', error.response?.data || error.message);
                  setRecognizedText('Error during OCR recognition.');
            }
      };

      // Handle capture and recognition
      const handleCaptureAndRecognize = () => {
            if (imageSrc) {
                  const base64Image = imageSrc.split(',')[1]; // Extract base64 part
                  recognizeText(base64Image);
            }
      };

      // Inline styles for simplicity
      const styles = {
            container: { textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
            webcam: { width: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
            button: {
                  margin: '10px',
                  padding: '10px 20px',
                  fontSize: '18px',
                  color: 'white',
                  backgroundColor: '#4CAF50',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
            },
            image: { width: '300px', borderRadius: '10px', marginTop: '10px' },
            textArea: { marginTop: '20px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px' }
      };

      return (
            <div style={styles.container}>
                  <h1>Parking System - Plate Detection</h1>
                  <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={styles.webcam}
                  />
                  <button style={styles.button} onClick={capture}>IN</button>

                  {imageSrc && (
                        <div>
                              <h2>Captured Image</h2>
                              <img src={imageSrc} alt="Captured" style={styles.image} />
                              <button style={styles.button} onClick={handleCaptureAndRecognize}>Recognize Plate</button>
                        </div>
                  )}

                  <div style={styles.textArea}>
                        <h2>Recognized Plate</h2>
                        <pre>{recognizedText}</pre>
                  </div>
            </div>
      );
};

export default App;
