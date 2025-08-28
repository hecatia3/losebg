# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rembg import remove
from PIL import Image
import io

app = FastAPI(title="Background Removal API")

# CORS middleware untuk Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Background Removal API is running"}

@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    try:
        # Validasi file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        input_data = await file.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Return processed image
        return StreamingResponse(
            io.BytesIO(output_data),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=no_bg_image.png"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
