'use client'

import { useState } from 'react'

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    setProcessedUrl('')
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/remove-background', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const blob = await response.blob()
      const processedImageUrl = URL.createObjectURL(blob)
      setProcessedUrl(processedImageUrl)

    } catch (err) {
      setError(`Failed to process image: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedUrl) return

    const link = document.createElement('a')
    link.href = processedUrl
    link.download = 'no-background.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setProcessedUrl('')
    setError('')
    // Reset file input
    const fileInput = document.getElementById('file-input')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Background Remover
          </h1>
          <p className="text-gray-600 text-lg">
            Remove backgrounds from your images instantly using AI
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center text-2xl">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Click to upload an image
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, JPEG up to 10MB
              </p>
            </label>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Processing Section */}
        {previewUrl && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Process Image
              </h2>
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                ❌ Reset
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Original</h3>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Background Removed
                </h3>
                <div className="border rounded-lg overflow-hidden bg-transparent bg-opacity-50" 
                     style={{backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'}}>
                  {processedUrl ? (
                    <img
                      src={processedUrl}
                      alt="Processed"
                      className="w-full h-64 object-contain"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-400">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Processed image will appear here'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={processImage}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  '🚀 Remove Background'
                )}
              </button>

              {processedUrl && (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download size={20} />
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 text-xl">📁</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">1. Upload Image</h4>
              <p className="text-sm text-gray-600">Select any image with a background you want to remove</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 text-xl">🤖</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">2. AI Processing</h4>
              <p className="text-sm text-gray-600">Our AI automatically detects and removes the background</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 text-xl">💾</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">3. Download Result</h4>
              <p className="text-sm text-gray-600">Get your image with transparent background in PNG format</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
