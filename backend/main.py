from fastapi import FastAPI


app = FastAPI()

@app.get("/api/sky")
def sky(lat: float, lon: float, date: str):
    best_match = [
            {"name": "Orion", 
             "score": 9.2,
             "peak_alt": 52,
             "azimuth": 135,
             "best_time": "23:10"},
            {"name": "Taurus", 
             "score": 7.8,
             "peak_alt": 61,
             "azimuth": 95,
             "best_time": "21:40"},
            {"name": "Gemini", 
             "score": 6.1,
             "peak_alt": 33,
             "azimuth": 60,
             "best_time": "23:10"},
            {"name": "Corvus", 
             "score": 5.2,
             "peak_alt": 21,
             "azimuth": 91,
             "best_time": "23:49"},
            ]
    
    return best_match
