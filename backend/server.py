from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import git
import openai
import os
from urllib.parse import urlparse

from typing import Optional

from middlewares import processing, connection, db

app = FastAPI()

# Allow CORS from your frontend URL
# origins = [
#     "http://localhost:5173",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoRequest(BaseModel):
    repo_path: str
    api_key: Optional[str] = None

class GetRepoRequest(BaseModel):
    repo_path: str

@app.post("/summarize")
def generate_summaries(request: RepoRequest):
    try:
        if not db.check_if_repo_exists(url=request.repo_path):

            title = connection.get_title(request.repo_path)
            description = connection.get_description(request.repo_path)
            summaries = processing.summarize_git_repo(repo_path=connection.clone_repo(request.repo_path))

            db.save_new_changes(request.repo_path, summaries=summaries, title=title, description=description)
            return {"status": "success"}
        else:
            new_summaries = processing.summarize_existing_git_repo(repo_path=connection.clone_repo(request.repo_path), repo_url=request.repo_path)
            db.save_existing_changes(url=request.repo_path, summaries=new_summaries)
            return {"status": "success"}
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": e
            }
    
@app.get("/getrepo")
def get_summaries(repo_path: str):

    repo = db.get_existing_repo(repo_path)

    parsed_url = urlparse(repo_path)
    path_parts = parsed_url.path.strip("/").split("/")


    title: str = repo["title"]
    description: str = repo["description"]
    owner: str = path_parts[0]
    summaries: list = list(repo["changes"])

    if not summaries:
        return {
            "status": "success",
            "message": "No summaries are available."
        }

    return {
        "status": "success",
        "payload": {
            "title": title,
            "description": description,
            "owner": owner,
            "summaries": summaries
        }
    }

@app.get("/verify-access")
def verify_access(repo_url: str):
    return connection.verify_access(repo_url=repo_url)