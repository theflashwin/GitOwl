from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import git
import openai
import os
from urllib.parse import urlparse

from typing import Optional, Dict

from middlewares import processing, connection, db, schemas
from tasks import summarize_repo_task, update_summaries_task
from schemas.requests import EditCommitBulletDescription, EditCommitDescriptionRequest, EditCommitTitleRequest, EditRepoTitleRequest, EditRepoDescriptionRequest, DeleteCommitRequest

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "API is live!"}

@app.post("/summarize")
def generate_summaries(request: RepoRequest):
    try:
        if not db.check_if_repo_exists(url=request.repo_path):

            # check if user has more than five repositories
            if not db.check_user_free_tier(user_id=request.user_id):
                return {
                    "status": "error",
                    "message": "You cannot create more than 5 changelogs on a free account."
                }

            # perform error checks
            if request.api_key and not connection.verify_github_token(request.repo_path, request.api_key):
                return {
                    "status": "error",
                    "message": "This token is not valid for this repository."
                    }
            
            # perform rate limiting

            title = connection.get_title(request.repo_path)
            description = connection.get_description(request.repo_path, github_token=request.api_key)

            db.set_repo_owner(repo_url=request.repo_path, user_id=request.user_id)
            db.save_new_changes(request.repo_path, summaries=[], title=title, description=description, user_id=request.user_id)

            # kickoff background task for summarization (because it takes forever lmao)
            summarize_repo_task.delay(repo_url=request.repo_path, api_key=request.api_key)

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
    users: Dict = repo.get("users", {})

    return {
        "status": "success",
        "payload": {
            "title": title,
            "description": description,
            "owner": owner,
            "summaries": summaries,
            "users": users
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
        
        # check if already being updated
        if db.check_if_repo_updating(repo_url=request.repo_path):
            return {
                "status": "error",
                "message": "Update has already been triggered. Processing now..."
            }
        
        # set the state to be processing
        db.set_state(repo_url=request.repo_path, state=schemas.RepoStates.PROCESSING)

        update_summaries_task.delay(repo_url=request.repo_path, api_key=request.api_key)

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

@app.get("/get-user-repos")
def get_user_repos(user_id: str):
    try:
        repos = db.fetch_user(user_id=user_id)["repos"]

        result = []
        for repo in repos:
            result.append(db.get_repo_info(repo_url=repo))

        return {
            "status": "success",
            "payload": result
        }
    
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some internal server error occurred"
        }
    
@app.post("/edit-commit-title")
def edit_commit_title(request: EditCommitTitleRequest):
    
    try:
        db.edit_commit_title(repo_url=request.repo_url, commit_hash=request.commit_hash, new_title=request.new_title)
        return {
            "status": "success",
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some error occurred while updating the title"
        }

@app.post("/edit-commit-description")
def edit_commit_description(request: EditCommitDescriptionRequest):
    
    try:
        db.edit_commit_description(repo_url=request.repo_url, commit_hash=request.commit_hash, new_description=request.new_description)
        return {
            "status": "success",
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some error occurred while updating the description"
        }

@app.post("/edit-commit-bullet")
def edit_commit_bullet(request: EditCommitBulletDescription):
    
    try:
        db.edit_commit_bullet(repo_url=request.repo_url, commit_hash=request.commit_hash, index=request.index, new_bullet=request.new_bullet)
        return {
            "status": "success",
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some error occurred while updating the bullet"
        }
    
@app.post("/edit-repo-title")
def edit_repo_title(request: EditRepoTitleRequest):
    
    try: 
        db.edit_repo_title(repo_url=request.repo_url, new_title=request.new_title)
        return {
            "status": "success",
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some error occurred while updating the title"
        }

@app.post("/edit-repo-description")
def edit_repo_description(request: EditRepoDescriptionRequest):
    
    try:
        db.edit_repo_description(repo_url=request.repo_url, new_description=request.new_description)
        return {
            "status": "success",
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some error occurred while updating the description"
        }
    
@app.post("/delete-commit")
def delete_commit_bullet(request: DeleteCommitRequest):

    try:
        db.delete_commit(repo_url=request.repo_url, commit_hash=request.commit_hash)
        return {
            "status": "success"
        }
    except Exception as e:
        print(e)
        return {
            "status": "error",
            "message": "Some server-side error occurred"
        }