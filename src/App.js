import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

function App() {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [completedBlob, setCompletedBlob] = useState(null);

  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true);
    webcamRef.current.stream.getVideoTracks()[0].start();
  }, [webcamRef, setCapturing]);

  const handleStopCaptureClick = React.useCallback(async () => {
    setCapturing(false);
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const buffer = Buffer.from(await recordedBlob.arrayBuffer());
    const video = await ffmpeg.run('-i', 'input.webm', 'output.mp4');
    const blob = new Blob([buffer], { type: 'video/mp4' });
    setCompletedBlob(blob);
  }, [webcamRef, setCapturing, recordedChunks]);

  const handleDataAvailable = React.useCallback(({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  }, [setRecordedChunks]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam audio={false} ref={webcamRef} />
        {capturing ? (
          <button onClick={handleStopCaptureClick}>Stop Capture</button>
        ) : (
          <button onClick={handleStartCaptureClick}>Start Capture</button>
        )}
        {completedBlob && <video src={URL.createObjectURL(completedBlob)} />}
      </header>
    </div>
  );
}

export default App;
