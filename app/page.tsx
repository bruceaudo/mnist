"use client"
import { useRef, MouseEvent, TouchEvent, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid'

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>("_")
  const [accuracy, setAccuracy] = useState<string>("_")
  const [loading, setLoading] = useState<boolean>(false)

  // Function to initialize drawing
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0];
      x = touch.clientX - canvas.offsetLeft;
      y = touch.clientY - canvas.offsetTop;
    } else {
      // Mouse event
      x = event.clientX - canvas.offsetLeft;
      y = event.clientY - canvas.offsetTop;
    }

    // Begin drawing path
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.moveTo(x, y);
  };

  // Function to continue drawing
  const continueDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0];
      x = touch.clientX - canvas.offsetLeft;
      y = touch.clientY - canvas.offsetTop;
    } else {
      // Mouse event
      x = event.clientX - canvas.offsetLeft;
      y = event.clientY - canvas.offsetTop;
    }

    // Draw line to current coordinates
    ctx.lineTo(x, y);
    ctx.stroke();
  };

   // Function to end drawing
  const endDrawing = () => {
    setIsDrawing(false);
  };

  // Function to clear canvas contents
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendData = async () => {
  const imageData = canvasRef.current?.toDataURL('image/png');
  const randNum = Math.random()
  if (imageData) {
    try {
      setLoading(prev => !prev)
      const formData = new FormData();
      formData.append('img', dataURLtoBlob(imageData), `image_${randNum}.png`);

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGuess(data.guess)
        setAccuracy(data.accuracy)
        setLoading(prev => !prev)
      } else {
        setLoading(prev => !prev)
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      setLoading(prev => !prev)
      console.error('Error:', error);
    }
  } else {
    console.log("Image URL is null");
  }
};

   const dataURLtoBlob = (dataURL: string) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  return (
    <main className="flex w-full justify-center">
      <section className="flex flex-col space-y-4 w-3/4 sm:w-1/2 lg:w-[400px]">
        <canvas
          ref={canvasRef}
          className="h-[350px] mt-16 relative"
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseOut={endDrawing}
          onMouseUp={endDrawing}
          onTouchMove={continueDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          />
        {loading && 
          <button className="bg-sky-500 rounded p-4 flex justify-center">
            <ArrowPathIcon className='h-8 w-8 text-white animate-spin' />
          </button>
        }
        {!loading &&
          <button onClick={sendData} className="bg-sky-500 rounded p-4">Predict</button>
        }
        <button onClick={clearCanvas} className='flex justify-center'>
          <ArrowPathIcon className="w-8 h-8 sm:w-8 sm:h-8" />
        </button>
        <div className="flex justify-center space-x-8">
          <p>
            <span>Prediction: </span>
            {guess &&
              <span className="">{guess}</span>
            }
          </p>
          <p>
            <span>Probability: </span>
            {accuracy &&
              <span className="">{accuracy}%</span>
            }
          </p>
        </div>
      </section>
    </main>
  );
}
