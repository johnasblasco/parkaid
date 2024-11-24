import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App = () => {
      const [imageSrc, setImageSrc] = useState(null);
      const [recognizedText, setRecognizedText] = useState('');
      const webcamRef = useRef(null);

      // Constraints to use the back camera
      const videoConstraints = {
            facingMode: { exact: 'environment' }  // 'environment' uses the back camera
      };

      const capture = () => {
            const imageSrc = webcamRef.current.getScreenshot();
            setImageSrc(imageSrc);
      };

      const recognizeText = async (imageBase64) => {
            const apiKey = 'K82741021788957';
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
                  if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
                        setRecognizedText(response.data.ParsedResults[0].ParsedText);
                  } else {
                        setRecognizedText('No text detected.');
                  }
            } catch (error) {
                  console.error('OCR Error:', error.response?.data || error.message);
                  setRecognizedText('Error during OCR recognition.');
            }
      };

      const handleCaptureAndRecognize = () => {
            if (imageSrc) {
                  const base64Image = imageSrc.split(',')[1];
                  recognizeText(base64Image);
            }
      };

      return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                  <h1 className="text-3xl font-bold mb-6 text-gray-800">Parking Plate Detection</h1>

                  <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
                        <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={videoConstraints}  // Use back camera
                              className="rounded-lg border border-gray-300"
                              width={640}
                        />
                  </div>

                  <button
                        onClick={capture}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                  >
                        Capture IN
                  </button>

                  {imageSrc && (
                        <div className="text-center">
                              <h2 className="text-xl font-semibold mb-2 text-gray-700">Captured Image</h2>
                              <img src={imageSrc} alt="Captured" className="rounded-lg border border-gray-300 mb-4" width={300} />
                              <button
                                    onClick={handleCaptureAndRecognize}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                              >
                                    Recognize Plate
                              </button>
                        </div>
                  )}

                  {recognizedText && (
                        <div className="mt-6 bg-white shadow-md rounded-lg p-4 w-full max-w-md text-center">
                              <h2 className="text-xl font-semibold mb-2 text-gray-700">Detected Plate Number:</h2>
                              <pre className="text-lg text-gray-900">{recognizedText}</pre>
                        </div>
                  )}
            </div>
      );
};

export default App;
