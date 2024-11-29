import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App = () => {
      const [imageSrc, setImageSrc] = useState(null); // Captured image
      const [recognizedText, setRecognizedText] = useState(''); // OCR result
      const [vehicleData, setVehicleData] = useState(null); // Vehicle match data
      const [category, setCategory] = useState('4 Wheels'); // Default vehicle category
      const [loading, setLoading] = useState(false); // Loading indicator
      const webcamRef = useRef(null);

      const videoConstraints = {
            facingMode: { exact: 'environment' },
      };

      // Capture image from webcam
      const capture = () => {
            const imageSrc = webcamRef.current.getScreenshot();
            setImageSrc(imageSrc);
      };

      // Perform OCR to recognize text
      const recognizeText = async (imageBase64) => {
            const apiKey = 'K82741021788957';
            const formData = new FormData();
            formData.append('base64Image', `data:image/jpeg;base64,${imageBase64}`);
            formData.append('apikey', apiKey);
            formData.append('OCREngine', '2');

            try {
                  console.log('Starting OCR recognition...');
                  setLoading(true); // Set loading to true

                  const response = await axios.post(
                        'https://api.ocr.space/parse/image',
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                  );

                  console.log('OCR response:', response.data);

                  if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
                        const detectedPlate = response.data.ParsedResults[0].ParsedText.trim();
                        setRecognizedText(detectedPlate);
                        console.log('Detected Plate:', detectedPlate);

                        // Proceed to check the detected plate
                        if (detectedPlate) {
                              checkPlateInSystem(detectedPlate);
                        } else {
                              console.error('Empty or invalid detected plate.');
                              setRecognizedText('No text detected.');
                        }
                  } else {
                        setRecognizedText('No text detected.');
                  }
            } catch (error) {
                  console.error('OCR Error:', error.response?.data || error.message);
                  setRecognizedText('Error during OCR recognition.');
            } finally {
                  setLoading(false); // Always reset loading state
            }
      };

      // Check if the recognized plate is already in the system
      const checkPlateInSystem = async (plateNumber) => {
            try {
                  console.log(`Checking plate in the system: ${plateNumber}`);
                  const response = await axios.get('https://capstone-parking.onrender.com/vehicle');

                  if (response.data && Array.isArray(response.data)) {
                        const parkedInVehicles = response.data.filter(vehicle => vehicle.status === true);
                        const matchedVehicle = parkedInVehicles.find(vehicle => vehicle.plateNumber === plateNumber);

                        if (matchedVehicle) {
                              console.log('Vehicle found:', matchedVehicle);
                              setVehicleData(matchedVehicle);
                        } else {
                              console.log('No matching vehicle found.');
                              setVehicleData(null);
                        }
                  } else {
                        console.error('Invalid or empty response from the API.');
                        setVehicleData(null);
                  }
            } catch (error) {
                  console.error('Error checking plate:', error.message);
                  setVehicleData(null); // Clear data in case of error
            }
      };

      // Handle the "Park In" operation
      const handleParkIn = async () => {
            const ticketNumber = Math.floor(100000 + Math.random() * 900000); // Generate random ticket number
            const newVehicle = {
                  ticketNumber,
                  startDate: new Date().toISOString(),
                  plateNumber: recognizedText,
                  category,
                  endDate: null,
                  status: true,
                  charges: category === '2 Wheels' ? 15 : 20,
                  extraCharges: 0,
            };

            try {
                  console.log('Parking in new vehicle:', newVehicle);
                  const response = await axios.post('https://capstone-parking.onrender.com/vehicle', newVehicle);

                  if (response.data) {
                        alert('Vehicle parked in successfully!');
                        setVehicleData(response.data);
                  }
            } catch (error) {
                  console.error('Error parking in:', error.message);
            }
      };

      // Handle the "Park Out" operation
      const handleParkOut = async () => {
            if (!vehicleData) return;

            try {
                  console.log('Parking out vehicle:', vehicleData);
                  const response = await axios.put(
                        `https://capstone-parking.onrender.com/vehicle/${vehicleData._id}`,
                        {
                              endDate: new Date().toISOString(),
                              status: false,
                        }
                  );

                  if (response.data) {
                        alert('Vehicle parked out successfully!');
                        setVehicleData(null); // Clear vehicle data
                  }
            } catch (error) {
                  console.error('Error parking out:', error.message);
            }
      };

      // Handle capture and recognition
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
                                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={loading}
                              >
                                    {loading ? 'Recognizing...' : 'Recognize Plate'}
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
