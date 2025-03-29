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
    user_id: str

class GetRepoRequest(BaseModel):
    repo_path: str

@app.post("/summarize")
def generate_summaries(request: RepoRequest):
    try:
        if not db.check_if_repo_exists(url=request.repo_path):

            # perform error checks
            print(connection.verify_github_token(request.repo_path, request.api_key))
            if request.api_key and not connection.verify_github_token(request.repo_path, request.api_key):
                return {
                    "status": "error",
                    "message": "This token is not valid for this repository."
                    }

            title = connection.get_title(request.repo_path)
            description = connection.get_description(request.repo_path, github_token=request.api_key)
            summaries = processing.summarize_github_repo(repo_url=request.repo_path, api_key=request.api_key)

            db.save_new_changes(request.repo_path, summaries=summaries, title=title, description=description)

            # now, associate the repo with the user
            db.set_repo_owner(repo_url=request.repo_path, user_id=request.user_id)

            return {"status": "success"}
        else:
            return {"status": "success"}
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some backend error occurred, please try again later!"
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

@app.post("/update")
def update_summaries(request: RepoRequest):

    try:
        # perform error checks
        if request.api_key and not connection.verify_github_token(request.repo_path, request.api_key):
            return {
                "status": "error",
                "message": "This token is not valid for this repository."
                }

        # first, fetch updated summaries
        new_summaries = processing.update_existing_repo(repo_url=request.repo_path, api_key=request.api_key)

        # second, push these to the database
        db.save_existing_changes(url=request.repo_path, new_summaries=new_summaries)

        return {
            "status": "success",
        }

    except Exception as e:

        print(e)

        return {
            "status": "error",
            "message": "Some network error occurred"
        }

@app.get("/verify-access")
def verify_access(repo_url: str):
    return connection.verify_access(repo_url=repo_url)