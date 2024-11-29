import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App = () => {
      const [imageSrc, setImageSrc] = useState(null);
      const [recognizedText, setRecognizedText] = useState('');
      const [vehicleData, setVehicleData] = useState(null); // Stores data for matched vehicle
      const [category, setCategory] = useState('4 Wheels'); // Default category
      const webcamRef = useRef(null);

      const videoConstraints = {
            facingMode: { exact: 'environment' },
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
                        const detectedPlate = response.data.ParsedResults[0].ParsedText.trim();
                        setRecognizedText(detectedPlate);
                        checkPlateInSystem(detectedPlate);
                  } else {
                        setRecognizedText('No text detected.');
                  }
            } catch (error) {
                  console.error('OCR Error:', error.response?.data || error.message);
                  setRecognizedText('Error during OCR recognition.');
            }
      };

      const checkPlateInSystem = async (plateNumber) => {
            try {
                  const response = await axios.get(`https://capstone-parking.onrender.com/vehicle?plateNumber=${plateNumber}`);
                  if (response.data) {
                        setVehicleData(response.data);
                  } else {
                        setVehicleData(null);
                  }
            } catch (error) {
                  console.error('Error checking plate:', error.message);
            }
      };


      const handleParkIn = async () => {
            const ticketNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit ticket number
            const newVehicle = {
                  ticketNumber,
                  plateNumber: recognizedText,
                  category,
                  startDate: new Date().toISOString(),
                  status: true,
                  charges: category === '2 Wheels' ? 15 : 20,
                  extraCharges: 0,
            };

            try {
                  const response = await axios.post('https://capstone-parking.onrender.com/vehicle', newVehicle);
                  if (response.data) {
                        alert('Vehicle parked in successfully!');
                        setVehicleData(response.data);
                  }
            } catch (error) {
                  console.error('Error parking in:', error.message);
            }
      };


      const handleParkOut = async () => {
            if (!vehicleData) return;

            try {
                  const response = await axios.put(`https://capstone-parking.onrender.com/vehicle/${vehicleData._id}`, {
                        endDate: new Date().toISOString(),
                        status: false,
                  });
                  if (response.data) {
                        alert('Vehicle parked out successfully!');
                        setVehicleData(null);
                  }
            } catch (error) {
                  console.error('Error parking out:', error.message);
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
                              videoConstraints={videoConstraints}
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
                              {!vehicleData ? (
                                    <>
                                          <div className="flex justify-center mt-4">
                                                <label className="mr-4 text-gray-700">
                                                      <input
                                                            type="radio"
                                                            value="2 Wheels"
                                                            checked={category === '2 Wheels'}
                                                            onChange={() => setCategory('2 Wheels')}
                                                            className="mr-1"
                                                      />
                                                      2 Wheels
                                                </label>
                                                <label className="mr-4 text-gray-700">
                                                      <input
                                                            type="radio"
                                                            value="3 Wheels"
                                                            checked={category === '3 Wheels'}
                                                            onChange={() => setCategory('3 Wheels')}
                                                            className="mr-1"
                                                      />
                                                      3 Wheels
                                                </label>
                                                <label className="text-gray-700">
                                                      <input
                                                            type="radio"
                                                            value="4 Wheels"
                                                            checked={category === '4 Wheels'}
                                                            onChange={() => setCategory('4 Wheels')}
                                                            className="mr-1"
                                                      />
                                                      4 Wheels
                                                </label>
                                          </div>
                                          <button
                                                onClick={handleParkIn}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                                          >
                                                Park In
                                          </button>
                                    </>
                              ) : (
                                    <button
                                          onClick={handleParkOut}
                                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                                    >
                                          Park Out
                                    </button>
                              )}
                        </div>
                  )}
            </div>
      );
};

export default App;
